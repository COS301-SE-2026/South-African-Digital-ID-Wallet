using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

// Shared JobRuns claim/complete/fail lifecycle for any repository backing a daily scheduled
// background job (see DailyScheduledBackgroundService). Handles concurrent-claim safety and
// reclaiming failed or stale "Running" rows so a stuck job can be retried on the next run.
public abstract class JobRunRepositoryBase
{
    protected readonly AppDbContext Context;
    private static readonly TimeSpan StaleRunningThreshold = TimeSpan.FromHours(1);

    protected JobRunRepositoryBase(AppDbContext context)
    {
        Context = context;
    }

    public async Task<Guid?> TryClaimJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken)
    {
        var jobRun = new JobRun
        {
            Id = Guid.NewGuid(),
            JobName = jobName,
            RunDate = runDate,
            Status = JobRunStatus.Running,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        Context.JobRuns.Add(jobRun);

        try
        {
            await Context.SaveChangesAsync(cancellationToken);
            return jobRun.Id;
        }
        catch (DbUpdateException due) when (IsUniqueConstraintViolation(due))
        {
            Context.Entry(jobRun).State = EntityState.Detached;
            return await TryReclaimFailedOrStaleRunAsync(jobName, runDate, cancellationToken);
        }
    }

    private async Task<Guid?> TryReclaimFailedOrStaleRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken)
    {
        var staleCutoff = DateTime.UtcNow - StaleRunningThreshold;

        var reclaimed = await Context.JobRuns
            .Where(j => j.JobName == jobName
                && j.RunDate == runDate
                && (j.Status == JobRunStatus.Failed || (j.Status == JobRunStatus.Running && j.CreatedAt < staleCutoff)))
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(j => j.Status, JobRunStatus.Running)
                .SetProperty(j => j.ErrorMessage, (string?)null)
                .SetProperty(j => j.ProcessedCount, 0)
                .SetProperty(j => j.CompletedAt, (DateTime?)null)
                .SetProperty(j => j.CreatedAt, DateTime.UtcNow)
                .SetProperty(j => j.UpdatedAt, DateTime.UtcNow),
                cancellationToken);

        if (reclaimed == 0)
        {
            return null;
        }

        var existing = await Context.JobRuns
            .AsNoTracking()
            .SingleAsync(j => j.JobName == jobName
                && j.RunDate == runDate,
                cancellationToken);

        return existing.Id;
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException due)
    {
        return due.InnerException switch
        {
            SqlException sqlEx => sqlEx.Number == 2601 || sqlEx.Number == 2627,
            SqliteException sqliteEx => sqliteEx.SqliteErrorCode == 19,
            _ => false,
        };
    }

    public async Task<bool> HasCompletedJobRunTodayAsync(string jobName, DateTime runDate, CancellationToken cancellationToken)
    {
        return await Context.JobRuns
            .AsNoTracking()
            .AnyAsync(j => j.JobName == jobName
                && j.RunDate == runDate
                && j.Status == JobRunStatus.Completed,
                cancellationToken);
    }

    public async Task MarkJobRunCompletedAsync(Guid jobRunId, int processedCount, CancellationToken cancellationToken)
    {
        var jobRun = await Context.JobRuns.SingleAsync(j => j.Id == jobRunId, cancellationToken);
        jobRun.Status = JobRunStatus.Completed;
        jobRun.CompletedAt = DateTime.UtcNow;
        jobRun.ProcessedCount = processedCount;

        await Context.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkJobRunFailedAsync(Guid jobRunId, string errorMessage, int processedCount, CancellationToken cancellationToken)
    {
        Context.ChangeTracker.Clear();

        var jobRun = await Context.JobRuns.SingleAsync(j => j.Id == jobRunId, cancellationToken);

        jobRun.Status = JobRunStatus.Failed;
        jobRun.CompletedAt = DateTime.UtcNow;
        jobRun.ErrorMessage = errorMessage;
        jobRun.ProcessedCount = processedCount;

        await Context.SaveChangesAsync(cancellationToken);
    }

    public async Task<JobRun?> GetJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken)
    {
        return await Context.JobRuns
            .AsNoTracking()
            .SingleOrDefaultAsync(j => j.JobName == jobName
                && j.RunDate == runDate,
                cancellationToken);
    }
}