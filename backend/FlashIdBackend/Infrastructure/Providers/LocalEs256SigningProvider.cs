using System.Buffers.Text;
using System.Security.Cryptography;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public sealed class LocalEs256SigningProvider : ICredentialSigningProvider, IDisposable
{
    private const string Es256 = "ES256";
    private readonly ECDsa _key;
    private readonly CredentialSigningKey _activeKey;
    // ECDsa instances are not guaranteed thread-safe, so concurrent signing requests must take turns.
    private readonly Lock _keyLock = new();

    public LocalEs256SigningProvider(IConfiguration config)
    {
        var keyId = config["Signing:Credential:Kid"];

        // An empty kid would be written into every credential header, and no verifier could match it to a key.
        if (string.IsNullOrWhiteSpace(keyId))
        {
            throw new InvalidOperationException("Credential signing key id is not configured.");
        }

        // base64 of a PKCS#8 private key
        var privateKeyBase64 = config["Signing:Credential:PrivateKey"];

        if (string.IsNullOrWhiteSpace(privateKeyBase64))
        {
            throw new InvalidOperationException("Credential signing private key is not configured.");
        }

        var privateKeyBytes = Convert.FromBase64String(privateKeyBase64);
        var key = ECDsa.Create();

        try
        {
            key.ImportPkcs8PrivateKey(privateKeyBytes, out _);

            // Other 256-bit curves such as brainpoolP256r1 and secp256k1 would load and sign, but no ES256 verifier accepts them.
            var parameters = key.ExportParameters(false);
            if (key.KeySize != 256 || parameters.Curve.Oid?.Value != ECCurve.NamedCurves.nistP256.Oid.Value)
            {
                throw new InvalidOperationException("Credential signing key must be an EC P-256 key.");
            }

            // The key never changes for this singleton, so the public half is exported once here.
            var publicJwk = new EcPublicJwk("EC", "P-256", keyId, Base64Url.EncodeToString(parameters.Q.X!), Base64Url.EncodeToString(parameters.Q.Y!));
            _activeKey = new CredentialSigningKey(keyId, Es256, publicJwk);
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

        return Task.FromResult(_activeKey);
    }

    public Task<byte[]> SignAsync(string keyId, byte[] signingInput, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        // The kid is already inside the signed header, so signing with another key would produce a credential nobody can verify.
        if (keyId != _activeKey.KeyId)
        {
            throw new InvalidOperationException($"Credential signing key '{keyId}' is not the active key.");
        }

        byte[] signature;
        lock (_keyLock)
        {
            // Hashes with SHA-256 and returns raw r||s 64 bytes instead of DER
            signature = _key.SignData(signingInput, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

            // An issued offline credential cannot be recalled, so a signature that fails its own check is never returned.
            if (!_key.VerifyData(signingInput, signature, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation))
            {
                throw new CryptographicException("Credential signature failed verification after signing.");
            }
        }

        return Task.FromResult(signature);
    }

    public void Dispose() => _key.Dispose();
}
