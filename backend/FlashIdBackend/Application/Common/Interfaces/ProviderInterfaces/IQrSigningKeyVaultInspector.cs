namespace Application.Common.Interfaces.ProviderInterfaces;

public sealed record VaultKeyVersion(string Version, EcPublicJwk PublicJwk);

public interface IQrSigningKeyVaultInspector
{
    Task<VaultKeyVersion> GetLatestKeyVersionAsync(CancellationToken cancellationToken);
}