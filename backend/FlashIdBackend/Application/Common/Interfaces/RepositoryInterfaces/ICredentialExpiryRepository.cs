using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICredentialExpiryRepository
{
    Task<List<Credential>> GetExpiredActiveCredentialsPageAsync(DateTime asOfUtc, Guid afterId, int pageSize, CancellationToken cancellationToken);
    Task<Guid?> TryClaimJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken);
    Task<bool> HasCompletedJobRunTodayAsync(string jobName, DateTime runDate, CancellationToken cancellationToken);
    Task MarkJobRunCompletedAsync(Guid jobRunId, int processedCount, CancellationToken cancellationToken);
    Task MarkJobRunFailedAsync(Guid jobRunId, string errorMessage, int processedCount, CancellationToken cancellationToken);
    Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken);
    Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken);
    Task<JobRun?> GetJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}