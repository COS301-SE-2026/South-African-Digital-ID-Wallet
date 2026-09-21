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
}
