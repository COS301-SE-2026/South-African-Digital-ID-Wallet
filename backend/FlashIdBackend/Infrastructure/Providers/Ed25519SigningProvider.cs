using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;
using NSec.Cryptography;

namespace Infrastructure.Providers;

public class Ed25519SigningProvider : IQrSigningProvider
{
    private readonly Key _key;
    private readonly PublicKey _publicKey;
    private static readonly SignatureAlgorithm Algorithm = SignatureAlgorithm.Ed25519;

    public Ed25519SigningProvider(IConfiguration config)
    {
        var privateKeyBase64 = config["Qr:Ed25519PrivateKey"]
            ?? throw new InvalidOperationException("QR signing private key not configured.");

        var privateKeyBytes = Convert.FromBase64String(privateKeyBase64);
        _key = Key.Import(Algorithm, privateKeyBytes, KeyBlobFormat.RawPrivateKey);
        _publicKey = _key.PublicKey;
    }

    public string Sign(string payload)
    {
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        var signature = Algorithm.Sign(_key, payloadBytes);
        return Convert.ToBase64String(signature);
    }

    public bool Verify(string payload, string signature)
    {
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        var signatureBytes = Convert.FromBase64String(signature);
        return Algorithm.Verify(_publicKey, payloadBytes, signatureBytes);
    }
}