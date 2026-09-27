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
}
