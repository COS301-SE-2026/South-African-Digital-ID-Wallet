using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.Data.Sqlite;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class OfflinePackageRepository : IOfflinePackageRepository
{
    // SQL server: 2601 is a duplicate key in a unique index, 2627 a unique constraint violation.
    private const int SqlServerDuplicateKey = 2601;
    private const int SqlServerUniqueConstraint = 2627;
    // SQLite reports every constraint failure as error 19, so the extended code is what distinguishes
    // a duplicate revocation index from an FK or NOT NULL bug that should not be retried.
    private const int SqliteUniqueConstraint = 2067;
    private const int SqlitePrimaryKeyConstraint = 1555;
    private readonly AppDbContext _context;

    public OfflinePackageRepository(AppDbContext context)
    {
        _context = context;
    }

    // Tracked on purpose: the minted pakage is written back onto this entry
    public async Task<Credential?> GetForPackagingAsync(Guid credentialId, CancellationToken cancellationToken) =>
        await _context.Credentials
            .Include(c => c.Citizen)
            .Include(c => c.IdentityDocument)
            .Include(c => c.DriversLicense)
            .FirstOrDefaultAsync(c => c.Id == credentialId, cancellationToken);

    public async Task<int> NextRevocationIndexAsync(CancellationToken cancellationToken)
    {
        var highest = await _context.Credentials.MaxAsync(c => c.RevocationIndex, cancellationToken);

        return (highest ?? 0) + 1;
    }

    public async Task<bool> TrySaveMintedPackageAsync(CancellationToken cancellationToken)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException due) when (IsUniqueIndexViolation(due))
        {
            // 2 citizens minted at the same moment and picked the same index. Nothing written
            return false;
        }
    }

    private static bool IsUniqueIndexViolation(DbUpdateException due) => due.InnerException switch
    {
        SqlException se => se.Number is SqlServerDuplicateKey or SqlServerUniqueConstraint,
        SqliteException sle => sle.SqliteExtendedErrorCode == SqliteUniqueConstraint,
        _ => false,
    };

    public async Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken)
    {
        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task SaveAuditLogDiscardingChangesAsync(AuditLog auditLog, CancellationToken cancellationToken)
    {
        // Marking the tracked credentials Unchanged leaves the in-memory values alone but stops EF
        // writing them, so a failed mint can be recorded without storing the package it failed on.
        foreach (var entry in _context.ChangeTracker.Entries<Credential>().Where(entry => entry.State == EntityState.Modified))
        {
            entry.State = EntityState.Unchanged;
        }

        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<int>> GetRevokedIndexesAsync(CancellationToken cancellationToken) =>
        await _context.Credentials
            .AsNoTracking()
            .Where(c => c.RevocationIndex != null && c.Status != CredentialStatus.Active)
            .OrderBy(c => c.RevocationIndex)
            .Select(c => c.RevocationIndex!.Value)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlySet<Guid>> GetExistingAuditLogIdsAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken) =>
        (await _context.AuditLogs
            .AsNoTracking()
            .Where(a => ids.Contains(a.Id))
            .Select(a => a.Id)
            .ToListAsync(cancellationToken))
        .ToHashSet();

    public async Task<IReadOnlyDictionary<int, Credential>> GetCredentialsByRevocationIndexAsync(IReadOnlyCollection<int> revocationIndexes, CancellationToken cancellationToken) =>
        await _context.Credentials
            .AsNoTracking()
            .Where(c => c.RevocationIndex != null && revocationIndexes.Contains(c.RevocationIndex.Value))
            .ToDictionaryAsync(c => c.RevocationIndex!.Value, cancellationToken);

    public async Task<bool> TryAddAuditLogsAsync(IReadOnlyCollection<AuditLog> auditLogs, CancellationToken cancellationToken)
    {
        _context.AuditLogs.AddRange(auditLogs);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException due) when (IsDuplicateKey(due))
        {
            // Two uploads of the same scans raced and the other stored them first. The rows that failed are
            // untracked, so the context is clean if it is used again in this request.
            _context.ChangeTracker.Clear();
            return false;
        }
    }

    // The audit id is the primary key. SQL Server reports a duplicate as 2627; SQLite uses its own extended code.
    private static bool IsDuplicateKey(DbUpdateException due) =>
        IsUniqueIndexViolation(due) || due.InnerException is SqliteException { SqliteExtendedErrorCode: SqlitePrimaryKeyConstraint };
}
