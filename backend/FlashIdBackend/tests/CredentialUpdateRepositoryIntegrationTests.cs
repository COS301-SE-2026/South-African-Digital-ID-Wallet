using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Repositories.Decorators;
using Microsoft.AspNetCore.Connections;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class CredentialUpdateRepositoryIntegrationTests
{
    private const string JobName = "CredentialUpdate";

    private sealed class FakeInnerRepository : ICredentialUpdateRepository
    {
        public int SaveChangesCalls;
        public int FailFirstNCalls;

        public Task<List<Citizen>> GetCitizensWithActiveCredentialsPageAsync(Guid afterId, int pageSize, CancellationToken cancellationToken) => Task.FromResult(new List<Citizen>());
        public Task<Guid?> TryClaimJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken) => Task.FromResult<Guid?>(Guid.NewGuid());
        public Task<bool> HasCompletedJobRunTodayAsync(string jobName, DateTime runDate, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task MarkJobRunCompletedAsync(Guid jobRunId, int processedCount, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task MarkJobRunFailedAsync(Guid jobRunId, string errorMessage, int processedCount, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task<JobRun?> GetJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken) => Task.FromResult<JobRun?>(null);
        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveChangesCalls++;
            if (SaveChangesCalls <= FailFirstNCalls)
            {
                throw new DbUpdateException("Simulated transient failure");
            }

            return Task.CompletedTask;
        }
    }

    private static AppDbContext CreateContext()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    private static (User User, Citizen Citizen) CreateCitizenWithUser(string saId)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = $"{saId}@goat.com",
            PhoneNumber = "0821234567",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPwd123!"), // NOSONAR
            PasswordSet = true,
            IsDeleted = false,
            IsEmailVerified = true,
            Role = UserRole.Citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = saId,
            Names = "LeBron",
            Surname = "James",
            DateOfBirth = new DateTime(1984, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Gender = Gender.Male,
            Status = CitizenStatus.Activated,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        return (user, citizen);
    }

    private static Credential BuildCredentialWithDriversLicense(Citizen citizen, CredentialStatus status)
    {
        var credentialId = Guid.NewGuid();

        return new Credential
        {
            Id = credentialId,
            Status = status,
            Signature = "sig",
            IssuedBy = "Licensing Dept Durban",
            IssueDate = DateTime.UtcNow.AddYears(-5),
            CitizenId = citizen.Id,
            Citizen = citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            DriversLicense = new DriversLicense
            {
                Id = Guid.NewGuid(),
                CredentialId = credentialId,
                LicenseNumber = Guid.NewGuid().ToString("N")[..13],
                LicenseCode = LicenseCode.EB,
                Restrictions = "00",
                ExpiryDate = DateTime.UtcNow.AddYears(1),
                PhotoPath = "photo.png",
                CountryOfIssue = "South Africa",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            },
        };
    }

    [Fact]
    public async Task GetCitizensWithActiveCredentialsPageAsync_ExcludesCitizensWithOnlyRevokedCredentials()
    {
        using var context = CreateContext();
        var repo = new CredentialUpdateRepository(context);

        var (activeUser, activeCitizen) = CreateCitizenWithUser("9001015800081");
        var (revokedUser, revokedCitizen) = CreateCitizenWithUser("9001015800082");

        var activeCredential = BuildCredentialWithDriversLicense(activeCitizen, CredentialStatus.Active);
        var revokedCredential = BuildCredentialWithDriversLicense(revokedCitizen, CredentialStatus.Revoked);

        await context.DomainUsers.AddRangeAsync([activeUser, revokedUser], TestContext.Current.CancellationToken);
        await context.Citizens.AddRangeAsync([activeCitizen, revokedCitizen], TestContext.Current.CancellationToken);
        await context.Credentials.AddRangeAsync([activeCredential, revokedCredential], TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var page = await repo.GetCitizensWithActiveCredentialsPageAsync(Guid.Empty, 500, TestContext.Current.CancellationToken);
        var result = Assert.Single(page);

        Assert.Equal(activeCitizen.Id, result.Id);
    }

    [Fact]
    public async Task GetCitizensWithActiveCredentialsPageAsync_FilteredIncludeOnlyReturnsActiveCredentialChild()
    {
        using var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();
        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;

        var (user, citizen) = CreateCitizenWithUser("9001015800083");
        var activeCredential = BuildCredentialWithDriversLicense(citizen, CredentialStatus.Active);
        var revokedCredential = BuildCredentialWithDriversLicense(citizen, CredentialStatus.Revoked);

        using (var seedContext = new AppDbContext(options))
        {
            await seedContext.Database.EnsureCreatedAsync(TestContext.Current.CancellationToken);
            await seedContext.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
            await seedContext.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
            await seedContext.Credentials.AddRangeAsync([activeCredential, revokedCredential], TestContext.Current.CancellationToken);
            await seedContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        }

        using var queryContext = new AppDbContext(options);
        var repo = new CredentialUpdateRepository(queryContext);

        var page = await repo.GetCitizensWithActiveCredentialsPageAsync(Guid.Empty, 500, TestContext.Current.CancellationToken);
        var result = Assert.Single(page);

        var includedCredential = Assert.Single(result.Credentials);
        Assert.Equal(activeCredential.Id, includedCredential.Id);
        Assert.NotNull(includedCredential.DriversLicense);
    }

    [Fact]
    public async Task GetCitizensWithActiveCredentialsPageAsync_RespectsKeysetPagination()
    {
        using var context = CreateContext();
        var repo = new CredentialUpdateRepository(context);

        var (user1, citizen1) = CreateCitizenWithUser("9001015800091");
        var (user2, citizen2) = CreateCitizenWithUser("9001015800092");

        var credential1 = BuildCredentialWithDriversLicense(citizen1, CredentialStatus.Active);
        var credential2 = BuildCredentialWithDriversLicense(citizen2, CredentialStatus.Active);

        await context.DomainUsers.AddRangeAsync([user1, user2], TestContext.Current.CancellationToken);
        await context.Citizens.AddRangeAsync([citizen1, citizen2], TestContext.Current.CancellationToken);
        await context.Credentials.AddRangeAsync([credential1, credential2], TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var firstPage = await repo.GetCitizensWithActiveCredentialsPageAsync(Guid.Empty, 1, TestContext.Current.CancellationToken);
        var pageResult = Assert.Single(firstPage);
        var secondPage = await repo.GetCitizensWithActiveCredentialsPageAsync(pageResult.Id, 1, TestContext.Current.CancellationToken);

        Assert.DoesNotContain(secondPage, c => c.Id == pageResult.Id);
    }

    [Fact]
    public async Task TryClaimJobRunAsync_SecondClaimForSameDate_Fails()
    {
        using var context = CreateContext();
        var runDate = DateTime.UtcNow.Date;
        var repo = new CredentialUpdateRepository(context);

        var firstClaim = await repo.TryClaimJobRunAsync(JobName, runDate, TestContext.Current.CancellationToken);
        var secondClaim = await repo.TryClaimJobRunAsync(JobName, runDate, TestContext.Current.CancellationToken);

        Assert.NotNull(firstClaim);
        Assert.Null(secondClaim);

        var count = await context.JobRuns.CountAsync(j => j.JobName == JobName && j.RunDate == runDate, TestContext.Current.CancellationToken);

        Assert.Equal(1, count);
    }

    [Fact]
    public async Task TryClaimJobRunAsync_ReclaimsRowLeftAsFailed()
    {
        using var context = CreateContext();
        var runDate = DateTime.UtcNow.Date;
        var repo = new CredentialUpdateRepository(context);
        var firstClaim = await repo.TryClaimJobRunAsync(JobName, runDate, TestContext.Current.CancellationToken);

        Assert.NotNull(firstClaim);

        await repo.MarkJobRunFailedAsync(firstClaim!.Value, "boom", 0, TestContext.Current.CancellationToken);

        var reclaim = await repo.TryClaimJobRunAsync(JobName, runDate, TestContext.Current.CancellationToken);

        Assert.NotNull(reclaim);
        Assert.Equal(firstClaim, reclaim);

        var jobRun = await context.JobRuns.AsNoTracking().SingleAsync(j => j.Id == firstClaim.Value, TestContext.Current.CancellationToken);

        Assert.Equal(JobRunStatus.Running, jobRun.Status);
        Assert.Null(jobRun.ErrorMessage);
    }

    [Fact]
    public async Task TryClaimJobRunAsync_ReclaimsStaleRunningRow()
    {
        using var context = CreateContext();
        var runDate = DateTime.UtcNow.Date;
        var repo = new CredentialUpdateRepository(context);
        var firstClaim = await repo.TryClaimJobRunAsync(JobName, runDate, TestContext.Current.CancellationToken);

        Assert.NotNull(firstClaim);

        var staleRow = await context.JobRuns.SingleAsync(j => j.Id == firstClaim!.Value, TestContext.Current.CancellationToken);
        staleRow.CreatedAt = DateTime.UtcNow.AddHours(-2);
        staleRow.UpdatedAt = DateTime.UtcNow.AddHours(-2);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        context.ChangeTracker.Clear();

        var reclaim = await repo.TryClaimJobRunAsync(JobName, runDate, TestContext.Current.CancellationToken);

        Assert.NotNull(reclaim);
        Assert.Equal(firstClaim, reclaim);

        var jobRun = await context.JobRuns.AsNoTracking().SingleAsync(j => j.Id == firstClaim!.Value, TestContext.Current.CancellationToken);

        Assert.Equal(JobRunStatus.Running, jobRun.Status);
        Assert.Null(jobRun.ErrorMessage);
        Assert.True(jobRun.CreatedAt > DateTime.UtcNow.AddMinutes(-1));
    }

    [Fact]
    public async Task RetryingDecorator_RetriesOnTransientFailureThenSucceeds()
    {
        var inner = new FakeInnerRepository { FailFirstNCalls = 2 };
        var decorator = new RetryingCredentialUpdateRepositoryDecorator(inner, maxAttempts: 3);

        await decorator.SaveChangesAsync(TestContext.Current.CancellationToken);

        Assert.Equal(3, inner.SaveChangesCalls);
    }

    [Fact]
    public async Task RetryingDecorator_ExhaustsRetriesAndThrows()
    {
        var inner = new FakeInnerRepository { FailFirstNCalls = 5 };
        var decorator = new RetryingCredentialUpdateRepositoryDecorator(inner, maxAttempts: 3);

        await Assert.ThrowsAsync<DbUpdateException>(() => decorator.SaveChangesAsync(TestContext.Current.CancellationToken));

        Assert.Equal(3, inner.SaveChangesCalls);
    }

    [Fact]
    public async Task RetryingDecorator_DelegatesPassthroughMethodsToInner()
    {
        var inner = new FakeInnerRepository();
        var decorator = new RetryingCredentialUpdateRepositoryDecorator(inner);

        Assert.False(await decorator.HasCompletedJobRunTodayAsync("CredentialUpdate", DateTime.UtcNow.Date, TestContext.Current.CancellationToken));

        await decorator.MarkJobRunFailedAsync(Guid.NewGuid(), "boom", 0, TestContext.Current.CancellationToken);
        await decorator.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.CitizenCredentialsUpdated,
            Details = "x",
            CreatedAt = DateTime.UtcNow
        }, TestContext.Current.CancellationToken);

        await decorator.AddNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            CitizenId = Guid.NewGuid(),
            Title = "x",
            Description = "x",
            Tone = "info",
            CreatedAt = DateTime.UtcNow
        }, TestContext.Current.CancellationToken);
    }
}
