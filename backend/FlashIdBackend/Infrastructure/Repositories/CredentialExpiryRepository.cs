using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CredentialExpiryRepository : ICredentialExpiryRepository
{
    private readonly AppDbContext _context;

    public CredentialExpiryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Credential>> GetExpiredActiveCredentialsPageAsync(DateTime asOfUtc, Guid afterId, int pageSize, CancellationToken cancellationToken)
    {
        return await _context.Credentials
            .Include(c => c.DriversLicense)
            .Where(c => c.Status == CredentialStatus.Active
                && c.DriversLicense != null
                && c.DriversLicense.ExpiryDate <= asOfUtc
                && c.Id > afterId)
            .OrderBy(c => c.Id)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<Guid?> TryClaimJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken)
    {
        var jobRun = new JobRun
        {
            Id = Guid.NewGuid(),
            JobName = jobName,
            RunDate = runDate,
            Status = JobRunStatus.Running,
        };

        _context.JobRuns.Add(jobRun);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return jobRun.Id;
        }
        catch (DbUpdateException due) when (IsUniqueConstraintViolation(due))
        {
            _context.Entry(jobRun).State = EntityState.Detached;
            return await TryReclaimFailedRunAsync(jobName, runDate, cancellationToken);
        }
    }

    private async Task<Guid?> TryReclaimFailedRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken)
    {
        var reclaimed = await _context.JobRuns
            .Where(j => j.JobName == jobName
                && j.RunDate == runDate
                && j.Status == JobRunStatus.Failed)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(j => j.Status, JobRunStatus.Running)
                .SetProperty(j => j.ErrorMessage, (string?)null)
                .SetProperty(j => j.ProcessedCount, 0)
                .SetProperty(j => j.CompletedAt, (DateTime?)null),
                cancellationToken);

        if (reclaimed == 0)
        {
            return null;
        }

        var existing = await _context.JobRuns
            .AsNoTracking()
            .SingleAsync(j => j.JobName == jobName
                && j.RunDate == runDate,
                cancellationToken);

        return existing.Id;
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException due)
    {
        return due.InnerException is SqlException sqlEx && (sqlEx.Number == 2601 || sqlEx.Number == 2627);
    }

    public async Task<bool> HasCompletedJobRunTodayAsync(string jobName, DateTime runDate, CancellationToken cancellationToken)
    {
        return await _context.JobRuns
            .AsNoTracking()
            .AnyAsync(j => j.JobName == jobName
                && j.RunDate == runDate
                && j.Status == JobRunStatus.Completed,
                cancellationToken);
    }

    public async Task MarkJobRunCompletedAsync(Guid jobRunId, int processedCount, CancellationToken cancellationToken)
    {
        var jobRun = await _context.JobRuns.SingleAsync(j => j.Id == jobRunId, cancellationToken);
        jobRun.Status = JobRunStatus.Completed;
        jobRun.CompletedAt = DateTime.UtcNow;
        jobRun.ProcessedCount = processedCount;

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkJobRunFailedAsync(Guid jobRunId, string errorMessage, int processedCount, CancellationToken cancellationToken)
    {
        var jobRun = await _context.JobRuns.SingleAsync(j => j.Id == jobRunId, cancellationToken);
        jobRun.Status = JobRunStatus.Failed;
        jobRun.CompletedAt = DateTime.UtcNow;
        jobRun.ErrorMessage = errorMessage;
        jobRun.ProcessedCount = processedCount;

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken)
    {
        await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
    }

    public async Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken)
    {
        await _context.Notifications.AddAsync(notification, cancellationToken);
    }

    public async Task<JobRun?> GetJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken)
    {
        return await _context.JobRuns
            .AsNoTracking()
            .SingleOrDefaultAsync(j => j.JobName == jobName
                && j.RunDate == runDate,
                cancellationToken);
    }

    public async Task SaveChangesWithRetryAsync(int maxAttempts, CancellationToken cancellationToken)
    {
        for (var atttempt = 1; ; atttempt++)
        {
            try
            {
                await _context.SaveChangesAsync(cancellationToken);
                return;
            }
            catch (DbUpdateException) when (atttempt < maxAttempts)
            {
                await Task.Delay(TimeSpan.FromMilliseconds(200 * atttempt), cancellationToken);
            }
        }
    }
}
