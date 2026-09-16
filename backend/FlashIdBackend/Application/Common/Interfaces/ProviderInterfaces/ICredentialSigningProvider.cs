namespace Application.Common.Interfaces.ProviderInterfaces;

public interface ICredentialSigningProvider
{
    // Snapshot of the key that signs next. The kid goes inside the signed header, so callers need it first.
    Task<CredentialSigningKey> GetActiveKeyAsync(CancellationToken cancellationToken);

    // Signs with exactly the key named by keyId, and refuses if that key is no longer the active one.
    Task<byte[]> SignAsync(string keyId, byte[] signingInput, CancellationToken cancellationToken);
}