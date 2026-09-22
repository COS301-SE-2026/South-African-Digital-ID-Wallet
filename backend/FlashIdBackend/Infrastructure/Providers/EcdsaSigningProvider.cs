using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public class EcdsaSigningProvider : IQrSigningProvider, IDisposable
{
    private readonly ECDsa _key;
    private readonly Lock _gate = new();

    public EcdsaSigningProvider(IConfiguration config)
    {
        var privateKeyBase64 = config["Qr:EcdsaPrivateKey"]
            ?? throw new InvalidOperationException("QR signing private key not configured.");

        _key = ECDsa.Create();
        _key.ImportPkcs8PrivateKey(Convert.FromBase64String(privateKeyBase64), out _);

        if (_key.KeySize != 256)
        {
            throw new InvalidOperationException(
                $"QR signing key must be P-256 for ES256; got a {_key.KeySize}-bit key.");
        }
    }

    public string Sign(string payload)
    {
        lock (_gate)
        {
            var signature = _key.SignData(
                Encoding.UTF8.GetBytes(payload),
                HashAlgorithmName.SHA256,
                DSASignatureFormat.Rfc3279DerSequence);

            return Convert.ToBase64String(signature);
        }
    }

    public bool Verify(string payload, string signature)
    {
        try
        {
            lock (_gate)
            {
                return _key.VerifyData(
                    Encoding.UTF8.GetBytes(payload),
                    Convert.FromBase64String(signature),
                    HashAlgorithmName.SHA256,
                    DSASignatureFormat.Rfc3279DerSequence);
            }
        }
        catch (Exception ex) when (ex is FormatException or CryptographicException)
        {
            return false;
        }
    }

    public void Dispose() => _key.Dispose();
}
