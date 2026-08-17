using Application.Common.Services;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Providers;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.Sqlite;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Infrastructure.Repositories.Decorators;

namespace tests;

public class CredentialExpiryRepositoryIntegrationTests
{
    private const string JobName = "CredentialExpiry";

    private sealed class FakeInnerRepository : ICredentialExpiryRepository
    {
        public int SaveChangesCalls;
        public int FailFirstNCalls;

        public Task<List<Credential>> GetExpiredActiveCredentialsPageAsync(DateTime asOfUtc, Guid afterId, int pageSize, CancellationToken cancellationToken) => Task.FromResult(new List<Credential>());
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
            Status = CitizenStatus.Activated,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        return (user, citizen);
    }

    private static Credential BuildCredentialWithDriversLicense(Citizen citizen, CredentialStatus status, DateTime expiryDate)
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
                ExpiryDate = expiryDate,
                PhotoPath = "photo.png",
                CountryOfIssue = "South Africa",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            },
        };
    }

    [Fact]
    public async Task GetExpiredActiveCredentialsPageAsync_ReturnsOnlyActiveExpiredDriversLicenses()
    {
        using var context = CreateContext();
        var repo = new CredentialExpiryRepository(context);
        var (user1, citizen1) = CreateCitizenWithUser("9001015800081");
        var (user2, citizen2) = CreateCitizenWithUser("9001015800082");
        var (user3, citizen3) = CreateCitizenWithUser("9001015800083");

        var expiredActive = BuildCredentialWithDriversLicense(citizen1, CredentialStatus.Active, DateTime.UtcNow.AddDays(-1));
        var futureActive = BuildCredentialWithDriversLicense(citizen2, CredentialStatus.Active, DateTime.UtcNow.AddYears(1));
        var expiredRevoked = BuildCredentialWithDriversLicense(citizen3, CredentialStatus.Revoked, DateTime.UtcNow.AddDays(-1));

        await context.DomainUsers.AddRangeAsync([user1, user2, user3], TestContext.Current.CancellationToken);
        await context.Citizens.AddRangeAsync([citizen1, citizen2, citizen3], TestContext.Current.CancellationToken);
        await context.Credentials.AddRangeAsync([expiredActive, futureActive, expiredRevoked], TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var page = await repo.GetExpiredActiveCredentialsPageAsync(DateTime.UtcNow, Guid.Empty, 500, TestContext.Current.CancellationToken);
        var result = Assert.Single(page);

        Assert.Equal(expiredActive.Id, result.Id);
    }

    [Fact]
    public async Task GetExpiredActiveCredentialsPageAsync_RespectsKeysetPagination()
    {
        using var context = CreateContext();
        var repo = new CredentialExpiryRepository(context);
        var (user1, citizen1) = CreateCitizenWithUser("9001015800091");
        var (user2, citizen2) = CreateCitizenWithUser("9001015800092");

        var first = BuildCredentialWithDriversLicense(citizen1, CredentialStatus.Active, DateTime.UtcNow.AddDays(-1));
        var second = BuildCredentialWithDriversLicense(citizen2, CredentialStatus.Active, DateTime.UtcNow.AddDays(-1));

        await context.DomainUsers.AddRangeAsync([user1, user2], TestContext.Current.CancellationToken);
        await context.Citizens.AddRangeAsync([citizen1, citizen2], TestContext.Current.CancellationToken);
        await context.Credentials.AddRangeAsync([first, second], TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var firstPage = await repo.GetExpiredActiveCredentialsPageAsync(DateTime.UtcNow, Guid.Empty, 1, TestContext.Current.CancellationToken);
        var pageResult = Assert.Single(firstPage);
        var secondPage = await repo.GetExpiredActiveCredentialsPageAsync(DateTime.UtcNow, pageResult.Id, 1, TestContext.Current.CancellationToken);

        Assert.DoesNotContain(secondPage, c => c.Id == pageResult.Id);
    }

    [Fact]
    public async Task TryClaimJobRunAsync_SecondClaimForSameDate_Fails()
    {
        using var context = CreateContext();
        var runDate = DateTime.UtcNow.Date;
        var repo = new CredentialExpiryRepository(context);

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
        var repo = new CredentialExpiryRepository(context);
        var firstClaim = await repo.TryClaimJobRunAsync(JobName, runDate, TestContext.Current.CancellationToken);

        Assert.NotNull(firstClaim);

        await repo.MarkJobRunFailedAsync(firstClaim!.Value, "boom", 0, TestContext.Current.CancellationToken);

        var reclaim = await repo.TryClaimJobRunAsync(JobName, runDate, TestContext.Current.CancellationToken);

        Assert.NotNull(reclaim);
        Assert.Equal(firstClaim, reclaim);

        var jobRun = await context.JobRuns.SingleAsync(j => j.Id == firstClaim.Value, TestContext.Current.CancellationToken);

        Assert.Equal(JobRunStatus.Running, jobRun.Status);
        Assert.Null(jobRun.ErrorMessage);
    }

    [Fact]
    public async Task RetryingDecorator_RetriesOnTransientFailureThemSucceeds()
    {
        var inner = new FakeInnerRepository { FailFirstNCalls = 2 };
        var decorator = new RetryingCredentialExpiryRepositoryDecorator(inner, maxAttempts: 3);

        await decorator.SaveChangesAsync(TestContext.Current.CancellationToken);

        Assert.Equal(3, inner.SaveChangesCalls);
    }

    [Fact]
    public async Task RetryingDecorator_ExhaustsRetriesAndThrows()
    {
        var inner = new FakeInnerRepository { FailFirstNCalls = 5 };
        var decorator = new RetryingCredentialExpiryRepositoryDecorator(inner, maxAttempts: 3);

        await Assert.ThrowsAsync<DbUpdateException>(() => decorator.SaveChangesAsync(TestContext.Current.CancellationToken));

        Assert.Equal(3, inner.SaveChangesCalls);
    }

}