using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;

namespace tests;

// Signs with a real P-256 key generated per instance, so signature assertions prove the signing input
// is genuinely what a verifier will hash. The private key never leaves memory.
internal sealed class TestSigningProvider : ICredentialSigningProvider, IDisposable
{
    private readonly ECDsa _key = ECDsa.Create(ECCurve.NamedCurves.nistP256);

    public string? LastSignedWithKeyId { get; private set; }

    public CredentialSigningKey ActiveKey
    {
        get
        {
            var parameters = _key.ExportParameters(false);
            return new CredentialSigningKey(
                "test-key-1",
                "ES256",
                new EcPublicJwk("EC", "P-256", "test-key-1", Base64Url.EncodeToString(parameters.Q.X!), Base64Url.EncodeToString(parameters.Q.Y!)));
        }
    }

    public Task<CredentialSigningKey> GetActiveKeyAsync(CancellationToken cancellationToken) => Task.FromResult(ActiveKey);

    public Task<byte[]> SignAsync(string keyId, byte[] signingInput, CancellationToken cancellationToken)
    {
        LastSignedWithKeyId = keyId;
        return Task.FromResult(_key.SignData(signingInput, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation));
    }

    public bool Verify(string signingInput, byte[] signature) =>
        _key.VerifyData(Encoding.ASCII.GetBytes(signingInput), signature, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

    public void Dispose() => _key.Dispose();
}
