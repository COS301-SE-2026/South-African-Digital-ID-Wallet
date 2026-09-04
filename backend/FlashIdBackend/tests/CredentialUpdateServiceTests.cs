using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Application.Features.Onboarding.Dtos;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class CredentialUpdateServiceTests
{
    private sealed class FakeCredentialUpdateRepository : ICredentialUpdateRepository
    {
        public List<Citizen> Citizens = new();
        public bool ClaimSucceeds = true;
        public bool AlreadyCompletedToday;
        public JobRun? ExistingJobRun;
        public List<AuditLog> AuditLogs = new();
        public List<Notification> Notifications = new();
        public int SaveChangesCalls;
        public int FailSaveChangesOnCall = -1;

        public Task<List<Citizen>> GetCitizensWithActiveCredentialsPageAsync(Guid afterId, int pageSize, CancellationToken cancellationToken)
        {
            var page = Citizens
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

    private sealed class FakeGovernmentRegistryGateway : IGovernmentRegistryGateway
    {
        public Dictionary<string, CitizenRecordDto?> CitizenRecords = new();
        public Dictionary<string, GovernmentRegistryIdentityDocumentDto?> IdentityDocuments = new();
        public Dictionary<string, GovernmentRegistryDriversLicenseDto?> DriversLicenses = new();
        public HashSet<string> ThrowForSaIds = new();
        public int IdentityDocumentCalls;
        public int DriversLicenseCalls;

        public Task<CitizenRecordDto?> GetCitizenBySaIdAsync(string saId)
        {
            if (ThrowForSaIds.Contains(saId))
            {
                throw new InvalidOperationException("Simulated gateway failure");
            }

            return Task.FromResult(CitizenRecords.GetValueOrDefault(saId));
        }

        public Task<GovernmentRegistryIdentityDocumentDto?> GetIdentityDocumentBySaIdAsync(string saId, CancellationToken cancellationToken)
        {
            IdentityDocumentCalls++;

            return Task.FromResult(IdentityDocuments.GetValueOrDefault(saId));
        }

        public Task<GovernmentRegistryDriversLicenseDto?> GetDriversLicenseBySaIdAsync(string saId, CancellationToken cancellationToken)
        {
            DriversLicenseCalls++;

            return Task.FromResult(DriversLicenses.GetValueOrDefault(saId));
        }
    }

    private sealed class Ctx
    {
        public FakeCredentialUpdateRepository Repo = null;
        public FakeGovernmentRegistryGateway Gateway = null;
        public CredentialUpdateService Service = null;
    }

    private static Ctx Setup()
    {
        var repo = new FakeCredentialUpdateRepository();
        var gateway = new FakeGovernmentRegistryGateway();

        return new Ctx
        {
            Repo = repo,
            Gateway = gateway,
            Service = new CredentialUpdateService(repo, gateway, new CredentialUpdateMapper()),
        };
    }

    private static Task<CredentialUpdateCheckResponseDto> Act(Ctx c) => c.Service.RunUpdateCheckAsync(TestContext.Current.CancellationToken);

    private static Citizen MakeCitizenWithDriversLicense(string saId = "9001015800081")
    {
        var credentialId = Guid.NewGuid();
        var citizenId = Guid.NewGuid();

        return new Citizen
        {
            Id = citizenId,
            SaId = saId,
            Names = "LeBron",
            Surname = "James",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Gender = Gender.Male,
            Status = CitizenStatus.Activated,
            Credentials = new List<Credential>
            {
                new Credential
                {
                    Id = credentialId,
                    CitizenId = citizenId,
                    Status = CredentialStatus.Active,
                    Signature = "old-sig",
                    IssuedBy = "Licensing Dept Durban",
                    IssueDate = new DateTime(2020, 1, 1),
                    DriversLicense = new DriversLicense
                    {
                        Id = Guid.NewGuid(),
                        CredentialId = credentialId,
                        LicenseNumber = "ABC1234567",
                        LicenseCode = LicenseCode.EB,
                        Restrictions = "00",
                        ExpiryDate = new DateTime(2030, 1, 1),
                        PhotoPath = "old-photo.png",
                        CountryOfIssue = "South Africa",
                    },
                },
            },
        };
    }

    private static Citizen MakeCitizenWithIdentityDocument(string saId = "9001015800082")
    {
        var credentialId = Guid.NewGuid();
        var citizenId = Guid.NewGuid();

        return new Citizen
        {
            Id = citizenId,
            SaId = saId,
            Names = "Steph",
            Surname = "Curry",
            DateOfBirth = new DateTime(1988, 5, 12, 0, 0, 0, DateTimeKind.Utc),
            Gender = Gender.Female,
            Status = CitizenStatus.Activated,
            Credentials = new List<Credential>
            {
                new Credential
                {
                    Id = credentialId,
                    CitizenId = citizenId,
                    Status = CredentialStatus.Active,
                    Signature = "old-sig",
                    IssuedBy = "Home Affairs Pretoria",
                    IssueDate = new DateTime(2018, 1, 1),
                    IdentityDocument = new IdentityDocument
                    {
                        Id = Guid.NewGuid(),
                        CredentialId = credentialId,
                        Citizenship = "South Africa",
                        CountryOfBirth = "South Africa",
                        Status = IdentityDocumentStatus.Citizen,
                        Nationality = "South African",
                        PhotoPath = "old-id-photo.png",
                    },
                },
            },
        };
    }

    private static CitizenRecordDto MatchingCitizenRecord(Citizen citizen) => new()
    {
        SaId = citizen.SaId,
        Names = citizen.Names,
        Surname = citizen.Surname,
        DateOfBirth = citizen.DateOfBirth,
        Gender = citizen.Gender.ToString(),
    };

    private static void SeedMatchingDriversLicense(Ctx c, Citizen citizen)
    {
        var credential = citizen.Credentials.Single();
        var dl = credential.DriversLicense!;
        c.Gateway.DriversLicenses[citizen.SaId] = new GovernmentRegistryDriversLicenseDto
        {
            CredentialId = credential.Id,
            Signature = credential.Signature,
            IssuedBy = credential.IssuedBy,
            IssueDate = DateOnly.FromDateTime(credential.IssueDate),
            LicenseNumber = dl.LicenseNumber,
            LicenseCode = dl.LicenseCode.ToString(),
            Restrictions = dl.Restrictions,
            ExpiryDate = DateOnly.FromDateTime(dl.ExpiryDate),
            PhotoBlob = dl.PhotoPath,
        };
    }


    [Fact]
    public async Task NoCitizens_CompletedWithZeroProcessed()
    {
        var c = Setup();
        var res = await Act(c);

        Assert.Equal(JobRunStatus.Completed, res.Status);
        Assert.Equal(0, res.ProcessedCount);
        Assert.Empty(c.Repo.AuditLogs);
        Assert.Empty(c.Repo.Notifications);
    }

    [Fact]
    public async Task CitizenWithNoDiffs_NoChangeNoAuditNoNotification()
    {
        var c = Setup();
        var citizen = MakeCitizenWithDriversLicense();
        c.Repo.Citizens.Add(citizen);
        c.Gateway.CitizenRecords[citizen.SaId] = MatchingCitizenRecord(citizen);
        SeedMatchingDriversLicense(c, citizen);

        var res = await Act(c);

        Assert.Equal(0, res.ProcessedCount);
        Assert.Empty(c.Repo.AuditLogs);
        Assert.Empty(c.Repo.Notifications);
    }

    [Fact]
    public async Task PersonalDetailChange_UpdatesCitizenAndWritesAuditAndNotification()
    {
        var c = Setup();
        var citizen = MakeCitizenWithDriversLicense();
        c.Repo.Citizens.Add(citizen);

        var record = MatchingCitizenRecord(citizen);
        record.Surname = "Dlamini";
        c.Gateway.CitizenRecords[citizen.SaId] = record;
        SeedMatchingDriversLicense(c, citizen);

        var res = await Act(c);

        Assert.Equal(1, res.ProcessedCount);
        Assert.Equal("Dlamini", citizen.Surname);

        var auditLog = Assert.Single(c.Repo.AuditLogs);
        Assert.Equal(AuditEventType.CitizenCredentialsUpdated, auditLog.EventType);
        Assert.Contains("Surname", auditLog.Details);

        var notification = Assert.Single(c.Repo.Notifications);
        Assert.Equal(citizen.Id, notification.CitizenId);
        Assert.Equal("Your details were updated", notification.Title);
    }

    [Fact]
    public async Task DriversLicenseFieldChange_UpdatesCredentialAndWritesAuditAndNotification()
    {
        var c = Setup();
        var citizen = MakeCitizenWithDriversLicense();
        c.Repo.Citizens.Add(citizen);
        c.Gateway.CitizenRecords[citizen.SaId] = MatchingCitizenRecord(citizen);

        var credential = citizen.Credentials.Single();
        var dl = credential.DriversLicense!;
        c.Gateway.DriversLicenses[citizen.SaId] = new GovernmentRegistryDriversLicenseDto
        {
            CredentialId = credential.Id,
            Signature = "new-sig",
            IssuedBy = credential.IssuedBy,
            IssueDate = DateOnly.FromDateTime(credential.IssueDate),
            LicenseNumber = dl.LicenseNumber,
            LicenseCode = dl.LicenseCode.ToString(),
            Restrictions = "01",
            ExpiryDate = DateOnly.FromDateTime(dl.ExpiryDate),
            PhotoBlob = dl.PhotoPath,
        };

        var res = await Act(c);

        Assert.Equal(1, res.ProcessedCount);
        Assert.Equal("new-sig", credential.Signature);
        Assert.Equal("01", dl.Restrictions);

        var auditLog = Assert.Single(c.Repo.AuditLogs);
        Assert.Equal(AuditEventType.CitizenCredentialsUpdated, auditLog.EventType);
        Assert.Contains("DriversLicense", auditLog.Details);

        var notification = Assert.Single(c.Repo.Notifications);
        Assert.Equal("Your driver's license was updated", notification.Title);
    }

    [Fact]
    public async Task IdentityDocumentFieldChange_UpdatesCredentialAndWritesAuditAndNotification()
    {
        var c = Setup();
        var citizen = MakeCitizenWithIdentityDocument();
        c.Repo.Citizens.Add(citizen);
        c.Gateway.CitizenRecords[citizen.SaId] = MatchingCitizenRecord(citizen);

        var credential = citizen.Credentials.Single();
        var id = credential.IdentityDocument!;
        c.Gateway.IdentityDocuments[citizen.SaId] = new GovernmentRegistryIdentityDocumentDto
        {
            CredentialId = credential.Id,
            Signature = "new-sig",
            IssuedBy = credential.IssuedBy,
            IssueDate = DateOnly.FromDateTime(credential.IssueDate),
            CountryOfBirth = id.CountryOfBirth,
            CitizenshipStatus = IdentityDocumentStatus.PermanentResident.ToString(),
            Nationality = id.Nationality,
            PhotoBlob = id.PhotoPath,
        };

        var res = await Act(c);

        Assert.Equal(1, res.ProcessedCount);
        Assert.Equal("new-sig", credential.Signature);
        Assert.Equal(IdentityDocumentStatus.PermanentResident, id.Status);

        var auditLog = Assert.Single(c.Repo.AuditLogs);
        Assert.Contains("IdentityDocument", auditLog.Details);

        var notification = Assert.Single(c.Repo.Notifications);
        Assert.Equal("Your ID document was updated", notification.Title);
    }

    [Fact]
    public async Task CitizenWithOnlyIdentityDocument_DriversLicenseGatewayNeverCalled()
    {
        var c = Setup();
        var citizen = MakeCitizenWithIdentityDocument();
        c.Repo.Citizens.Add(citizen);
        c.Gateway.CitizenRecords[citizen.SaId] = MatchingCitizenRecord(citizen);

        var credential = citizen.Credentials.Single();
        var id = credential.IdentityDocument!;
        c.Gateway.IdentityDocuments[citizen.SaId] = new GovernmentRegistryIdentityDocumentDto
        {
            CredentialId = credential.Id,
            Signature = credential.Signature,
            IssuedBy = credential.IssuedBy,
            IssueDate = DateOnly.FromDateTime(credential.IssueDate),
            CountryOfBirth = id.CountryOfBirth,
            CitizenshipStatus = id.Status.ToString(),
            Nationality = id.Nationality,
            PhotoBlob = id.PhotoPath,
        };

        await Act(c);

        Assert.Equal(1, c.Gateway.IdentityDocumentCalls);
        Assert.Equal(0, c.Gateway.DriversLicenseCalls);
    }

    [Fact]
    public async Task CombinedPersonalAndCredentialChange_WritesTwoAuditAndNotificationPairs()
    {
        var c = Setup();
        var citizen = MakeCitizenWithDriversLicense();
        c.Repo.Citizens.Add(citizen);

        var record = MatchingCitizenRecord(citizen);
        record.Surname = "Dlamini";
        c.Gateway.CitizenRecords[citizen.SaId] = record;

        var credential = citizen.Credentials.Single();
        var dl = credential.DriversLicense!;
        c.Gateway.DriversLicenses[citizen.SaId] = new GovernmentRegistryDriversLicenseDto
        {
            CredentialId = credential.Id,
            Signature = credential.Signature,
            IssuedBy = credential.IssuedBy,
            IssueDate = DateOnly.FromDateTime(credential.IssueDate),
            LicenseNumber = dl.LicenseNumber,
            LicenseCode = dl.LicenseCode.ToString(),
            Restrictions = "01",
            ExpiryDate = DateOnly.FromDateTime(dl.ExpiryDate),
            PhotoBlob = dl.PhotoPath,
        };

        var res = await Act(c);

        Assert.Equal(1, res.ProcessedCount);
        Assert.Equal(2, c.Repo.AuditLogs.Count);
        Assert.Equal(2, c.Repo.Notifications.Count);
    }

    [Fact]
    public async Task RegistryReturnsNullForDriversLicense_SkipsWithoutError()
    {
        var c = Setup();
        var citizen = MakeCitizenWithDriversLicense();
        c.Repo.Citizens.Add(citizen);
        c.Gateway.CitizenRecords[citizen.SaId] = MatchingCitizenRecord(citizen);

        var res = await Act(c);

        Assert.Equal(JobRunStatus.Completed, res.Status);
        Assert.Equal(0, res.ProcessedCount);
        Assert.Empty(c.Repo.AuditLogs);
    }

    [Fact]
    public async Task RegistryReturnsNullForCitizen_WritesSyncFailedAuditAndSkipsCredentialFetches()
    {
        var c = Setup();
        var citizen = MakeCitizenWithDriversLicense();
        c.Repo.Citizens.Add(citizen);

        var res = await Act(c);

        Assert.Equal(0, res.ProcessedCount);
        var auditLog = Assert.Single(c.Repo.AuditLogs);
        Assert.Equal(AuditEventType.CitizenCredentialsSyncFailed, auditLog.EventType);
        Assert.Equal(0, c.Gateway.DriversLicenseCalls);
    }

    [Fact]
    public async Task GatewayThrowsForOneCitizenInPage_MarksThatCitizenSyncFailedAndStillProcessesTheRest()
    {
        var c = Setup();
        var failing = MakeCitizenWithDriversLicense("9001015800083");
        var healthy = MakeCitizenWithDriversLicense("9001015800084");
        c.Repo.Citizens.Add(failing);
        c.Repo.Citizens.Add(healthy);

        c.Gateway.ThrowForSaIds.Add(failing.SaId);

        var record = MatchingCitizenRecord(healthy);
        record.Surname = "Zulu";
        c.Gateway.CitizenRecords[healthy.SaId] = record;
        SeedMatchingDriversLicense(c, healthy);

        var res = await Act(c);

        Assert.Equal(JobRunStatus.Completed, res.Status);
        Assert.Equal(1, res.ProcessedCount);

        var failedAudit = c.Repo.AuditLogs.Single(a => a.EventType == AuditEventType.CitizenCredentialsSyncFailed);
        Assert.Contains(failing.SaId, failedAudit.Details);

        var successAudit = c.Repo.AuditLogs.Single(a => a.EventType == AuditEventType.CitizenCredentialsUpdated);
        Assert.Contains(healthy.Id.ToString(), successAudit.Details);
    }

    [Fact]
    public async Task AlreadyClaimedAndNotCompleted_ThrowsAlreadyRunningException()
    {
        var c = Setup();
        c.Repo.ClaimSucceeds = false;
        c.Repo.AlreadyCompletedToday = false;

        await Assert.ThrowsAsync<CredentialUpdateJobAlreadyRunningException>(() => Act(c));
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
            JobName = "CredentialUpdate",
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
        var citizen = MakeCitizenWithDriversLicense();
        c.Repo.Citizens.Add(citizen);
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