using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.Credentials.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IOfflinePackageService
{
    // Retuns the stored package, minting a new one only when the old one is stale (D-007).
    // deviceKey is null until the wallet starts sending its holder key
    Task<OfflinePackageResponseDto> GetOrMintAsync(
        Guid credentialId,
        Guid requestUserId,
        EcPublicJwk? deviceKey,
        string ipAddress,
        CancellationToken cancellationToken
    );

    // The public keys a verifier needs to check issuer signatures while offline
    Task<IssuerKeysResponseDto> GetIssuerKeysAsync(CancellationToken cancellationToken);

    // A signed list of revocation indexes that must no longer verify, for a verifier to cache before going offline.
    Task<RevocationListResponseDto> GetRevocationListAsync(CancellationToken cancellationToken);

    // Writes one audit row per scan a verifier's phone made offline, skipping entries an earlier upload already recorded.
    Task<OfflineVerificationSyncResultDto> RecordOfflineVerificationsAsync(
        Guid verifierUserId,
        IReadOnlyList<OfflineVerificationEntryDto> entries,
        string ipAddress,
        CancellationToken cancellationToken
    );
}
