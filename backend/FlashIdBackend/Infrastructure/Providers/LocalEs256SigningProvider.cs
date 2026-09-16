using System.Buffers.Text;
using System.Security.Cryptography;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public sealed class LocalEs256SigningProvider : ICredentialSigningProvider, IDisposable
{
    private const string Es256 = "ES256";
    private readonly ECDsa _key;
    private readonly string _keyId;
    // ECDsa instances are not guaranteed thread-safe, so concurrent requests must take turns.
    private readonly Lock _keyLock = new();

    public LocalEs256SigningProvider(IConfiguration config)
    {
        _keyId = config["Signing:Credential:Kid"] ?? throw new InvalidOperationException("Credential signing key id is not configured.");

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

    // This provider holds one key, so the active key never changes while the app is running.
    public Task<CredentialSigningKey> GetActiveKeyAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        ECPoint q;

        lock (_keyLock)
        {
            // false exports only the public point, so the private key never leaves this class.
            q = _key.ExportParameters(false).Q;
        }

        var publicJwk = new EcPublicJwk("EC", "P-256", _keyId, Base64Url.EncodeToString(q.X!), Base64Url.EncodeToString(q.Y!));

        return Task.FromResult(new CredentialSigningKey(_keyId, Es256, publicJwk));
    }

    public Task<byte[]> SignAsync(string keyId, byte[] signingInput, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        // The kid is already inside the signed header, so signing with another key would produce a credential nobody can verify.
        if (keyId != _keyId)
        {
            throw new InvalidOperationException($"Credential signing key '{keyId}' is not the active key.");
        }

        lock (_keyLock)
        {
            // Hashes with SHA-256 and returns raw r||s 64 bytes instead of DER
            var signature = _key.SignData(signingInput, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

            return Task.FromResult(signature);
        }
    }

    public void Dispose() => _key.Dispose();
}