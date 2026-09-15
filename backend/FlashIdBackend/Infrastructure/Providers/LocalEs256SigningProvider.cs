using System.Buffers.Text;
using System.Security.Cryptography;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public sealed class LocalEs256SigningProvider : ICredentialSigningProvider, IDisposable
{
    private readonly ECDsa _key;

    // ECDsa instances are not guaranteed thread-safe, so concurrent requests must take turns.
    private readonly Lock _keyLock = new();

    public LocalEs256SigningProvider(IConfiguration config)
    {
        KeyId = config["Signing:Credential:Kid"] ?? throw new InvalidOperationException("Credential signing key id is not configured.");

        // base64 of a PKCS#8 private key
        var privateKeyBase64 = config["Signing:Credential:PrivateKey"] ?? throw new InvalidOperationException("Credential signing private key is not configured.");
        var privateKeyBytes = Convert.FromBase64String(privateKeyBase64);
        var key = ECDsa.Create();

        try
        {
            key.ImportPkcs8PrivateKey(privateKeyBytes, out _);

            // ES256 is only defined for P-256, so any other key is a configuration error.
            if (key.KeySize != 256)
            {
                throw new InvalidOperationException("Credential signing key must be an EC P-256 key.");
            }
        }
        catch
        {
            // ECDsa holds native memory, so release it if the key cannot be loaded.
            key.Dispose();
            throw;
        }
        finally
        {
            // clear private key bytes from memory
            CryptographicOperations.ZeroMemory(privateKeyBytes);
        }

        _key = key;
    }

    public string KeyId { get; }

    public string Algorithm => "ES256";

    public Task<byte[]> SignAsync(byte[] signingInput, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        lock (_keyLock)
        {
            // Hashes with SHA-256 and returns raw r||s 64 bytes instead of DER
            var signature = _key.SignData(signingInput, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

            return Task.FromResult(signature);
        }
    }

    public bool Verify(byte[] signingInput, byte[] signature)
    {
        // Rejects anything that is not exactly 64 bytes, such as a DER signature, before checking.
        if (signature.Length != 64)
        {
            return false;
        }

        lock (_keyLock)
        {
            return _key.VerifyData(signingInput, signature, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);
        }
    }

    public EcPublicJwk GetPublicJwk()
    {
        ECPoint q;
        lock (_keyLock)
        {
            // false exports only the public point, so the private key never leaves this class.
            q = _key.ExportParameters(false).Q;
        }

        return new EcPublicJwk("EC", "P-256", KeyId, Base64Url.EncodeToString(q.X!), Base64Url.EncodeToString(q.Y!));
    }

    public void Dispose() => _key.Dispose();
}