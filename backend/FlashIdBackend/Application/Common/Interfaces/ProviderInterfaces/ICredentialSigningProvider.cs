namespace Application.Common.Interfaces.ProviderInterfaces;

public interface ICredentialSigningProvider
{
    string KeyId { get; }
    string Algorithm { get; }
    Task<byte[]> SignAsync(byte[] signingInput, CancellationToken cancellationToken);
    bool Verify(byte[] signingInput, byte[] signature);
    EcPublicJwk GetPublicJwk();
}