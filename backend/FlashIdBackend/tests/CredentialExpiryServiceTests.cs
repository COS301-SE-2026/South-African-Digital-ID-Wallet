using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class CredentialExpiryServiceTests
{
    private sealed class FakeCredentialExpiryRepository : ICredentialExpiryRepository
    {
        public List<Credential> Credentials = new();
        public bool ClaimSucceeds = true;
        public bool AlreadyCompletedToday;
        public JobRun? ExistingJobRun;
        public List<AuditLog> AuditLogs = new();
        public List<Notification> Notifications = new();
        public int SaveChangesCalls;
        public int FailSaveChangesOnCall = -1;

        public Task<List<Credential>> GetExpiredActiveCredentialsPageAsync(DateTime asOfUtc, Guid afterId, int pageSize, CancellationToken cancellationToken)
        {
            var page = Credentials
                .Where(c => c.Id.CompareTo(afterId) > 0)
                .OrderBy(c => c.Id)
                .Take(pageSize)
                .ToList();
            return Task.FromResult(page);
        }

        public Task<Guid?> TryClaimJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken)
        {
            if (!ClaimSucceeds)
            {
                return Task.FromResult<Guid?>(null);
            }

            ExistingJobRun = new JobRun { Id = Guid.NewGuid(), JobName = jobName, RunDate = runDate, Status = JobRunStatus.Running };
            return Task.FromResult<Guid?>(ExistingJobRun.Id);
        }

        public Task<bool> HasCompletedJobRunTodayAsync(string jobName, DateTime runDate, CancellationToken cancellationToken) => Task.FromResult(AlreadyCompletedToday);

        public Task MarkJobRunCompletedAsync(Guid jobRunId, int processedCount, CancellationToken cancellationToken)
        {
            ExistingJobRun!.Status = JobRunStatus.Completed;
            ExistingJobRun.ProcessedCount = processedCount;
            ExistingJobRun.CompletedAt = DateTime.UtcNow;

            return Task.CompletedTask;
        }

        public Task MarkJobRunFailedAsync(Guid jobRunId, string errorMessage, int processedCount, CancellationToken cancellationToken)
        {
            ExistingJobRun!.Status = JobRunStatus.Failed;
            ExistingJobRun.ErrorMessage = errorMessage;
            ExistingJobRun.ProcessedCount = processedCount;
            ExistingJobRun.CompletedAt = DateTime.UtcNow;

            return Task.CompletedTask;
        }

        public Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken)
        {
            AuditLogs.Add(auditLog);

            return Task.CompletedTask;
        }

        public Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken)
        {
            Notifications.Add(notification);

            return Task.CompletedTask;
        }

        public Task<JobRun?> GetJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken) => Task.FromResult(ExistingJobRun);

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveChangesCalls++;
            if (SaveChangesCalls == FailSaveChangesOnCall)
            {
                throw new InvalidOperationException("Simulated SaveChanges failure");
            }

            return Task.CompletedTask;
        }
    }

    private sealed class Ctx
    {
        public FakeCredentialExpiryRepository Repo = null;
        public CredentialExpiryService Service = null;
    }

    private static Ctx Setup()
    {
        var repo = new FakeCredentialExpiryRepository();
        return new Ctx
        {
            Repo = repo,
            Service = new CredentialExpiryService(repo, new CredentialExpiryMapper()),
        };
    }

    private static Task<CredentialExpiryCheckResponseDto> Act(Ctx c) => c.Service.RunExpiryCheckAsync(TestContext.Current.CancellationToken);

    private static Credential MakeExpiredCredential()
    {
        var credentialId = Guid.NewGuid();
        var citizenId = Guid.NewGuid();

        return new Credential
        {
            Id = credentialId,
            CitizenId = citizenId,
            Status = CredentialStatus.Active,
            Signature = "sig",
            IssuedBy = "Licensing Dept Durban",
            IssueDate = DateTime.UtcNow.AddYears(-5),
            DriversLicense = new DriversLicense
            {
                Id = Guid.NewGuid(),
                CredentialId = credentialId,
                LicenseNumber = "ABC1234567",
                LicenseCode = LicenseCode.EB,
                Restrictions = "00",
                ExpiryDate = DateTime.UtcNow.AddDays(-30),
                PhotoPath = "photo.png",
                CountryOfIssue = "South Africa",
            },
        };
    }

    [Fact]
    public async Task NoExpiredCredentials_CompletedWithZeroProcessed()
    {
        var c = Setup();
        var res = await Act(c);

        Assert.Equal(JobRunStatus.Completed, res.Status);
        Assert.Equal(0, res.ProcessedCount);
        Assert.Empty(c.Repo.AuditLogs);
        Assert.Empty(c.Repo.Notifications);
    }

    [Fact]
    public async Task ExpiredCredentials_FlipsStatusAndWritesAuditAndNotification()
    {
        var c = Setup();
        var cred = MakeExpiredCredential();
        c.Repo.Credentials.Add(cred);
        var res = await Act(c);

        Assert.Equal(JobRunStatus.Completed, res.Status);
        Assert.Equal(1, res.ProcessedCount);
        Assert.Equal(CredentialStatus.Expired, cred.Status);

        var auditLog = Assert.Single(c.Repo.AuditLogs);
        Assert.Equal(AuditEventType.CredentialExpired, auditLog.EventType);
        Assert.Null(auditLog.ActorId);
        Assert.Contains(cred.Id.ToString(), auditLog.Details);

        var notification = Assert.Single(c.Repo.Notifications);
        Assert.Equal(cred.CitizenId, notification.CitizenId);
        Assert.Equal("Driver's license expired", notification.Title);
        Assert.DoesNotContain(cred.DriversLicense!.LicenseNumber, auditLog.Details);
        Assert.DoesNotContain(cred.DriversLicense!.PhotoPath, notification.Description);
    }

    [Fact]
    public async Task AlreadyClaimedAndNotCompleted_ThrowsAlreadyRunningException()
    {
        var c = Setup();
        c.Repo.ClaimSucceeds = false;
        c.Repo.AlreadyCompletedToday = false;

        await Assert.ThrowsAsync<CredentialExpiryJobAlreadyRunningException>(() => Act(c));
    }

    [Fact]
    public async Task AlreadyCompletedToday_ReturnsExistingResultWithoutReprocessing()
    {
        var c = Setup();
        c.Repo.ClaimSucceeds = false;
        c.Repo.AlreadyCompletedToday = true;
        c.Repo.ExistingJobRun = new JobRun
        {
            Id = Guid.NewGuid(),
            JobName = "CredentialExpiry",
            RunDate = DateTime.UtcNow.Date,
            Status = JobRunStatus.Completed,
            ProcessedCount = 4,
            CompletedAt = DateTime.UtcNow,
        };

        var res = await Act(c);

        Assert.Equal(JobRunStatus.Completed, res.Status);
        Assert.Equal(4, res.ProcessedCount);
        Assert.Equal(0, c.Repo.SaveChangesCalls);
        Assert.Empty(c.Repo.AuditLogs);
        Assert.Empty(c.Repo.Notifications);
    }

    [Fact]
    public async Task SaveChangesFails_MarksJobRunFailedInsteadOfThrowingPastTheService()
    {
        var c = Setup();
        c.Repo.Credentials.Add(MakeExpiredCredential());
        c.Repo.FailSaveChangesOnCall = 1;
        var res = await Act(c);

        Assert.Equal(JobRunStatus.Failed, res.Status);
        Assert.Contains("Simulated SaveChanges failure", res.ErrorMessage);
        Assert.Equal(0, res.ProcessedCount);
    }

    [Fact]
    public async Task HasCompletedTodayAsync_DelegatesToRepository()
    {
        var c = Setup();
        c.Repo.AlreadyCompletedToday = true;

        Assert.True(await c.Service.HasCompletedTodayAsync(TestContext.Current.CancellationToken));
    }
}