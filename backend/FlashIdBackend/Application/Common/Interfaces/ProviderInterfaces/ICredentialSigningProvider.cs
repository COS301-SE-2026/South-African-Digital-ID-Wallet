namespace Application.Common.Interfaces.ProviderInterfaces;

public interface ICredentialSigningProvider
{
    // Key Id written into each token header so verifiers know which public key to use
    string KeyId { get; }

    // JWS algorithm name written into each token header. Always ES256 for credentials
    string Algorithm { get; }

    // Signs the exact signing input bytes and returns a raw 64 byte r||s signature
    Task<byte[]> SignAsync(byte[] signingInput, CancellationToken cancellationToken);

    // Verifies a raw 64 byte signature over the signing input with this provider's public key
    bool Verify(byte[] signingInput, byte[] signature);

    // Public half of the key, published to verifiers through the issuer keys endpoint.
    EcPublicJwk GetPublicJwk();
}