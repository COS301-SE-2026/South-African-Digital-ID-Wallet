using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.Decorators;

public class RetryingCredentialExpiryRepositoryDecorator : ICredentialExpiryRepository
{
    private readonly ICredentialExpiryRepository _inner;
    private readonly int _maxAttempts;

    public RetryingCredentialExpiryRepositoryDecorator(ICredentialExpiryRepository inner, int maxAttempts = 3)
    {
        _inner = inner;
        _maxAttempts = maxAttempts;
    }

    public Task<List<Credential>> GetExpiredActiveCredentialsPageAsync(DateTime asOfUtc, Guid afterId, int pageSize, CancellationToken cancellationToken) => _inner.GetExpiredActiveCredentialsPageAsync(asOfUtc, afterId, pageSize, cancellationToken);
    public Task<Guid?> TryClaimJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken) => _inner.TryClaimJobRunAsync(jobName, runDate, cancellationToken);
    public Task<bool> HasCompletedJobRunTodayAsync(string jobName, DateTime runDate, CancellationToken cancellationToken) => _inner.HasCompletedJobRunTodayAsync(jobName, runDate, cancellationToken);
    public Task MarkJobRunCompletedAsync(Guid jobRunId, int processedCount, CancellationToken cancellationToken) => _inner.MarkJobRunCompletedAsync(jobRunId, processedCount, cancellationToken);
    public Task MarkJobRunFailedAsync(Guid jobRunId, string errorMessage, int processedCount, CancellationToken cancellationToken) => _inner.MarkJobRunFailedAsync(jobRunId, errorMessage, processedCount, cancellationToken);
    public Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken) => _inner.AddAuditLogAsync(auditLog, cancellationToken);
    public Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken) => _inner.AddNotificationAsync(notification, cancellationToken);
    public Task<JobRun?> GetJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken) => _inner.GetJobRunAsync(jobName, runDate, cancellationToken);

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                await _inner.SaveChangesAsync(cancellationToken);
                return;
            }
            catch (DbUpdateException) when (attempt < _maxAttempts)
            {
                await Task.Delay(TimeSpan.FromMilliseconds(200 * attempt), cancellationToken);
            }
        }
    }
}