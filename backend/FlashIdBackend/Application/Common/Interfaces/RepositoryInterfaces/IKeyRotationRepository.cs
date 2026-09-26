namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IKeyRotationRepository
{
    Task<Guid?> TryClaimJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken);
    Task<bool> HasCompletedJobRunTodayAsync(string jobName, DateTime runDate, CancellationToken cancellationToken);
    Task MarkJobRunCompletedAsync(Guid jobRunId, int processedCount, CancellationToken cancellationToken);
    Task MarkJobRunFailedAsync(Guid jobRunId, string errorMessage, int processedCount, CancellationToken cancellationToken);
}