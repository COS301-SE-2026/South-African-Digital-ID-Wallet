using Domain.Entities;
using Domain.Enums;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;

namespace Application.Common.Services;

public class CredentialExpiryService : ICredentialExpiryService
{
    private const string JobName = "CredentialExpiry";
    private const int PageSize = 500;
    private const int MaxSaveAttempts = 3;

    private readonly ICredentialExpiryRepository _repo;
    private readonly CredentialExpiryMapper _mapper;

    public CredentialExpiryService(ICredentialExpiryRepository repo, CredentialExpiryMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken)
    {
        var runDate = SastClock.TodayUtcMidnight(DateTime.UtcNow);

        return await _repo.HasCompletedJobRunTodayAsync(JobName, runDate, cancellationToken);
    }

    public async Task<CredentialExpiryCheckResponseDto> RunExpiryCheckAsync(CancellationToken cancellationToken)
    {
        var runDate = SastClock.TodayUtcMidnight(DateTime.UtcNow);
        var jobRunId = await _repo.TryClaimJobRunAsync(JobName, runDate, cancellationToken);

        if (jobRunId is null)
        {
            var alreadyCompleted = await _repo.HasCompletedJobRunTodayAsync(JobName, runDate, cancellationToken);
            if (!alreadyCompleted)
            {
                throw new CredentialExpiryJobAlreadyRunningException();
            }

            return _mapper.JobRunToResponseDto(await GetJobRunOrThrowAsync(runDate, cancellationToken));
        }

        var processedCount = 0;

        try
        {
            var afterId = Guid.Empty;

            while (true)
            {
                var page = await _repo.GetExpiredActiveCredentialsPageAsync(runDate, afterId, PageSize, cancellationToken);
                if (page.Count == 0)
                {
                    break;
                }

                foreach (var credential in page)
                {
                    credential.Status = CredentialStatus.Expired;
                    await _repo.AddAuditLogAsync(BuildAuditLog(credential), cancellationToken);
                    await _repo.AddNotificationAsync(BuildNotification(credential), cancellationToken);
                }

                await _repo.SaveChangesAsync(cancellationToken);

                processedCount += page.Count;
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

    private async Task<JobRun> GetJobRunOrThrowAsync(DateTime runDate, CancellationToken cancellationToken)
    {
        return await _repo.GetJobRunAsync(JobName, runDate, cancellationToken) ?? throw new InvalidOperationException("JobRun not found for today after claim/processing.");
    }

    private static AuditLog BuildAuditLog(Credential credential)
    {
        return new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.CredentialExpired,
            Details = $"CredentialId={credential.Id}; Type=DriversLicense; PreviousStatus=Active; ExpiryDate={credential.DriversLicense!.ExpiryDate:yyyy-MM-dd}",
            ActorId = null,
            CreatedAt = DateTime.UtcNow,
        };
    }

    private static Notification BuildNotification(Credential credential)
    {
        return new Notification
        {
            Id = Guid.NewGuid(),
            CitizenId = credential.CitizenId,
            Title = "Driver's license expired",
            Description = "Your driver's license has expired. Please renew it as soon as possible.",
            Tone = "warninng",
            CreatedAt = DateTime.UtcNow,
        };
    }
}