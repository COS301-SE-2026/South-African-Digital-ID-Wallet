using System.Buffers.Text;
using System.Security.Cryptography;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;
using Org.BouncyCastle.Asn1.X509;

namespace Infrastructure.Providers;

public sealed class LocalEs256SigningProvider : ICredentialSigningProvider, IDisposable
{
    private readonly ECDsa _key;
    public LocalEs256SigningProvider(IConfiguration config)
    {
        KeyId = config["Signing:Credential:Kid"] ?? throw new InvalidOperationException("Credential signing key id is not configured.");

        var privateKeyBase64 = config["Signing:Credential:PrivateKey"] ?? throw new InvalidOperationException("Credential signing private key is not configured.");
        var key = ECDsa.Create();

        try
        {
            key.ImportPkcs8PrivateKey(Convert.FromBase64String(privateKeyBase64), out _);
            if (key.KeySize != 256)
            {
                throw new InvalidOperationException("Credential signing key must be an EC P-256 key.");
            }
        }
        catch
        {
            key.Dispose();
            throw;
        }

        _key = key;
    }

    public string KeyId { get; }

    public string Algorithm => "ES256";

    public Task<byte[]> SignAsync(byte[] signingInput, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var signature = _key.SignData(signingInput, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

        return Task.FromResult(signature);
    }

    public bool Verify(byte[] signingInput, byte[] signature)
    {
        return signature.Length == 64 && _key.VerifyData(signingInput, signature, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);
    }

    public EcPublicJwk GetPublicJwk()
    {
        var q = _key.ExportParameters(false).Q;

        return new EcPublicJwk("EC", "P-256", KeyId, Base64Url.EncodeToString(q.X!), Base64Url.EncodeToString(q.Y!));
    }

    public void Dispose() => _key.Dispose();
}