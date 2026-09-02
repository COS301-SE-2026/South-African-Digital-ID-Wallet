using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;
using NSec.Cryptography;

namespace Infrastructure.Providers;

public class Ed25519SigningProvider : IQrSigningProvider
{
    private readonly Dictionary<string, Key> _keysByKid;
    private static readonly SignatureAlgorithm Algorithm = SignatureAlgorithm.Ed25519;
    public string CurrentKeyId { get; }
    public Ed25519SigningProvider(IConfiguration config)
    {
        var keyConfigs = config.GetSection("Qr:SigningKeys").Get<List<QrSigningKeyOptions>>();

        if (keyConfigs == null || keyConfigs.Count == 0)
            throw new InvalidOperationException("No QR signing keys configured.");

        _keysByKid = new Dictionary<string, Key>();
        foreach (var kc in keyConfigs)
        {
            var bytes = Convert.FromBase64String(kc.PrivateKey);
            _keysByKid[kc.Kid] = Key.Import(Algorithm, bytes, KeyBlobFormat.RawPrivateKey);
        }
        var activeKeys = keyConfigs.Where(k => k.Status == "Active").ToList();
        if (activeKeys.Count != 1)
            throw new InvalidOperationException("Exactly one QR signing key must have Status \"Active\".");

        CurrentKeyId = activeKeys[0].Kid;
    }

    public string Sign(string payload)
    {
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        var signature = Algorithm.Sign(_keysByKid[CurrentKeyId], payloadBytes);
        return Convert.ToBase64String(signature);
    }

    public bool Verify(string payload, string signature, string keyId)
    {
        if (!_keysByKid.TryGetValue(keyId, out var key))
            return false;
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        var signatureBytes = Convert.FromBase64String(signature);
        return Algorithm.Verify(key.PublicKey, payloadBytes, signatureBytes);
    }
}