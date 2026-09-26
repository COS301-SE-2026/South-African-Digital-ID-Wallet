using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IOfflinePackageRepository
{
    // Loads everything a package needs in one query.
    Task<Credential?> GetForPackagingAsync(Guid credentialId, CancellationToken cancellationToken);

    // The next free index. Allocated at first mint, so a credential never used offline never gets one.
    Task<int> NextRevocationIndexAsync(CancellationToken cancellationToken);

    // Returns false when another mint claimed the same revocation index, so the caller can allocate again.
    Task<bool> TrySaveMintedPackageAsync(CancellationToken cancellationToken);

    Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken);

    // For the failure path. A plain save would store a package whose write was never accepted
    Task SaveAuditLogDiscardingChangesAsync(AuditLog auditLog, CancellationToken cancellationToken);

    // Revocation indexes of credentials that must no longer verify offline: any status other than Active.
    Task<IReadOnlyList<int>> GetRevokedIndexesAsync(CancellationToken cancellationToken);

    // The audit ids among these that are already stored, so an upload retried by the phone is not written twice.
    Task<IReadOnlySet<Guid>> GetExistingAuditLogIdsAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken);

    // Offline audit entries carry a revocation index, not a credential id, so they are mapped back here.
    Task<IReadOnlyDictionary<int, Credential>> GetCredentialsByRevocationIndexAsync(IReadOnlyCollection<int> revocationIndexes, CancellationToken cancellationToken);

    // Returns false when another request stored one of these ids first, in which case nothing was written.
    Task<bool> TryAddAuditLogsAsync(IReadOnlyCollection<AuditLog> auditLogs, CancellationToken cancellationToken);
}
