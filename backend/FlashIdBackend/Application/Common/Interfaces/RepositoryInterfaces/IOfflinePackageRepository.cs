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
}
