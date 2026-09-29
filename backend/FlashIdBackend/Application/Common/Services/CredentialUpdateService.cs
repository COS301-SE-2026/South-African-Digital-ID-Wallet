using Domain.Entities;
using Domain.Enums;
using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Application.Features.Onboarding.Dtos;

namespace Application.Common.Services;

public class CredentialUpdateService : ICredentialUpdateService
{
    private const string JobName = "CredentialUpdate";
    private const int PageSize = 50;

    private readonly ICredentialUpdateRepository _repo;
    private readonly IGovernmentRegistryGateway _gateway;
    private readonly CredentialUpdateMapper _mapper;

    public CredentialUpdateService(ICredentialUpdateRepository repo, IGovernmentRegistryGateway gateway, CredentialUpdateMapper mapper)
    {
        _repo = repo;
        _gateway = gateway;
        _mapper = mapper;
    }


    public async Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken)
    {
        var runDate = SastClock.TodayUtcMidnight(DateTime.UtcNow);
        return await _repo.HasCompletedJobRunTodayAsync(JobName, runDate, cancellationToken);
    }


    public async Task<CredentialUpdateCheckResponseDto> RunUpdateCheckAsync(CancellationToken cancellationToken)
    {
        var runDate = SastClock.TodayUtcMidnight(DateTime.UtcNow);
        var jobRunId = await _repo.TryClaimJobRunAsync(JobName, runDate, cancellationToken);

        if (jobRunId is null)
        {
            var alreadyCompleted = await _repo.HasCompletedJobRunTodayAsync(JobName, runDate, cancellationToken);
            if (!alreadyCompleted)
            {
                throw new CredentialUpdateJobAlreadyRunningException();
            }

            return _mapper.JobRunToResponseDto(await GetJobRunOrThrowAsync(runDate, cancellationToken));
        }

        var processedCount = 0;

        try
        {
            var afterId = Guid.Empty;

            while (true)
            {
                var page = await _repo.GetCitizensWithActiveCredentialsPageAsync(afterId, PageSize, cancellationToken);
                if (page.Count == 0)
                {
                    break;
                }

                foreach (var citizen in page)
                {
                    try
                    {
                        if (await SyncCitizenAsync(citizen, cancellationToken))
                        {
                            processedCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        await _repo.AddAuditLogAsync(BuildSyncFailedAuditLog(citizen, ex), cancellationToken);
                    }
                }

                await _repo.SaveChangesAsync(cancellationToken);

                afterId = page[^1].Id;

                if (page.Count < PageSize)
                {
                    break;
                }
            }


            await _repo.MarkJobRunCompletedAsync(jobRunId.Value, processedCount, cancellationToken);
        }
        catch (Exception e)
        {
            await _repo.MarkJobRunFailedAsync(jobRunId.Value, e.Message, processedCount, cancellationToken);
        }

        return _mapper.JobRunToResponseDto(await GetJobRunOrThrowAsync(runDate, cancellationToken));
    }

    private async Task<bool> SyncCitizenAsync(Citizen citizen, CancellationToken cancellationToken)
    {
        var changed = false;

        var record = await _gateway.GetCitizenBySaIdAsync(citizen.SaId);
        if (record is null)
        {
            await _repo.AddAuditLogAsync(new AuditLog
            {
                Id = Guid.NewGuid(),
                EventType = AuditEventType.CitizenCredentialsSyncFailed,
                Details = $"SaId={citizen.SaId}; CitizenId={citizen.Id}; Error=Citizen no longer found in Government Registry.",
                ActorId = null,
                CreatedAt = DateTime.UtcNow,
            }, cancellationToken);
            return false;
        }

        if (await SyncCitizenFields(citizen, record))
        {
            changed = true;
        }

        foreach (var credential in citizen.Credentials.Where(c => c.Status == CredentialStatus.Active))
        {
            if (credential.IdentityDocument is not null)
            {
                var id = await _gateway.GetIdentityDocumentBySaIdAsync(citizen.SaId, cancellationToken);
                if (id is not null && await SyncIdentityDocument(credential, credential.IdentityDocument, id))
                {
                    changed = true;
                }
            }

            if (credential.DriversLicense is not null)
            {
                var dl = await _gateway.GetDriversLicenseBySaIdAsync(citizen.SaId, cancellationToken);
                if (dl is not null && await SyncDriversLicense(credential, credential.DriversLicense, dl))
                {
                    changed = true;
                }
            }
        }

        return changed;
    }


    private async Task<bool> SyncCitizenFields(Citizen citizen, CitizenRecordDto record)
    {
        var parsedGender = Enum.TryParse<Gender>(record.Gender, ignoreCase: true, out var g) ? g : Gender.Unspecified;

        if (citizen.Names == record.Names
            && citizen.Surname == record.Surname
            && citizen.DateOfBirth.Date == record.DateOfBirth.Date
            && citizen.Gender == parsedGender)
        {
            return false;
        }

        var details = $"CitizenId={citizen.Id}; Names:'{citizen.Names}'->'{record.Names}'; Surname:'{citizen.Surname}'->'{record.Surname}'; DateOfBirth:'{citizen.DateOfBirth:yyyy-MM-dd}'->'{record.DateOfBirth:yyyy-MM-dd}'; Gender:'{citizen.Gender}'->'{parsedGender}'";

        citizen.Names = record.Names;
        citizen.Surname = record.Surname;
        citizen.DateOfBirth = record.DateOfBirth;
        citizen.Gender = parsedGender;
        citizen.UpdatedAt = DateTime.UtcNow;

        await _repo.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.CitizenCredentialsUpdated,
            Details = details,
            ActorId = null,
            CreatedAt = DateTime.UtcNow,
        }, CancellationToken.None);

        await _repo.AddNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Title = "Your details were updated",
            Description = "Your personal details were updated to match the Government Registry.",
            Tone = "info",
            CreatedAt = DateTime.UtcNow,
        }, CancellationToken.None);

        return true;
    }

    private async Task<bool> SyncIdentityDocument(Credential credential, IdentityDocument identityDocument, GovernmentRegistryIdentityDocumentDto id)
    {
        var status = Enum.TryParse<IdentityDocumentStatus>(id.CitizenshipStatus, ignoreCase: true, out var parsedStatus) ? parsedStatus : identityDocument.Status;

        if (credential.Signature == id.Signature
            && credential.IssuedBy == id.IssuedBy
            && DateOnly.FromDateTime(credential.IssueDate) == id.IssueDate
            && identityDocument.CountryOfBirth == id.CountryOfBirth
            && identityDocument.Status == status
            && identityDocument.Nationality == id.Nationality
            && identityDocument.PhotoPath == id.PhotoBlob)
        {
            return false;
        }

        credential.Signature = id.Signature;
        credential.IssuedBy = id.IssuedBy;
        credential.IssueDate = id.IssueDate.ToDateTime(TimeOnly.MinValue);
        credential.UpdatedAt = DateTime.UtcNow;

        identityDocument.Citizenship = id.CountryOfBirth;
        identityDocument.CountryOfBirth = id.CountryOfBirth;
        identityDocument.Status = status;
        identityDocument.Nationality = id.Nationality;
        identityDocument.PhotoPath = id.PhotoBlob;
        identityDocument.UpdatedAt = DateTime.UtcNow;

        await _repo.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.CitizenCredentialsUpdated,
            Details = $"CredentialId={credential.Id}; Type=IdentityDocument; refreshed from Government Registry.",
            ActorId = null,
            CreatedAt = DateTime.UtcNow,
        }, CancellationToken.None);

        await _repo.AddNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            CitizenId = credential.CitizenId,
            Title = "Your ID document was updated",
            Description = "Your ID document details were refreshed from the Government Registry.",
            Tone = "info",
            CreatedAt = DateTime.UtcNow,
        }, CancellationToken.None);

        return true;
    }

    private async Task<bool> SyncDriversLicense(Credential credential, DriversLicense driversLicense, GovernmentRegistryDriversLicenseDto dl)
    {
        var licenseCode = Enum.TryParse<LicenseCode>(dl.LicenseCode, ignoreCase: true, out var parsedCode) ? parsedCode : driversLicense.LicenseCode;

        if (credential.Signature == dl.Signature
            && credential.IssuedBy == dl.IssuedBy
            && DateOnly.FromDateTime(credential.IssueDate) == dl.IssueDate
            && driversLicense.LicenseNumber == dl.LicenseNumber
            && driversLicense.LicenseCode == licenseCode
            && driversLicense.Restrictions == dl.Restrictions
            && DateOnly.FromDateTime(driversLicense.ExpiryDate) == dl.ExpiryDate
            && driversLicense.PhotoPath == dl.PhotoBlob)
        {
            return false;
        }

        credential.Signature = dl.Signature;
        credential.IssuedBy = dl.IssuedBy;
        credential.IssueDate = dl.IssueDate.ToDateTime(TimeOnly.MinValue);
        credential.UpdatedAt = DateTime.UtcNow;

        driversLicense.LicenseNumber = dl.LicenseNumber;
        driversLicense.LicenseCode = licenseCode;
        driversLicense.Restrictions = dl.Restrictions;
        driversLicense.ExpiryDate = dl.ExpiryDate.ToDateTime(TimeOnly.MinValue);
        driversLicense.PhotoPath = dl.PhotoBlob;

        await _repo.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.CitizenCredentialsUpdated,
            Details = $"CredentialId={credential.Id}; Type=DriversLicense; refreshed from Government Registry.",
            ActorId = null,
            CreatedAt = DateTime.UtcNow,
        }, CancellationToken.None);

        await _repo.AddNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            CitizenId = credential.CitizenId,
            Title = "Your driver's license was updated",
            Description = "Your driver's license details were refreshed from the Government Registry.",
            Tone = "info",
            CreatedAt = DateTime.UtcNow,
        }, CancellationToken.None);

        return true;
    }


    private static AuditLog BuildSyncFailedAuditLog(Citizen citizen, Exception ex)
    {
        return new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.CitizenCredentialsSyncFailed,
            Details = $"SaId={citizen.SaId}; CitizenId={citizen.Id}; Error={ex.Message}",
            ActorId = null,
            CreatedAt = DateTime.UtcNow,
        };
    }


    private async Task<JobRun> GetJobRunOrThrowAsync(DateTime runDate, CancellationToken cancellationToken)
    {
        return await _repo.GetJobRunAsync(JobName, runDate, cancellationToken) ?? throw new InvalidOperationException("JobRun not found for today after claim/processing.");
    }
}