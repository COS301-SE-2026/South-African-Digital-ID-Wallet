using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public class EcdsaSigningProvider : IQrSigningProvider, IDisposable
{
    private readonly ECDsa _key;

    public EcdsaSigningProvider(IConfiguration config)
    {
        var privateKeyBase64 = config["Qr:EcdsaPrivateKey"]
            ?? throw new InvalidOperationException("QR signing private key not configured.");

        _key = ECDsa.Create();
        _key.ImportPkcs8PrivateKey(Convert.FromBase64String(privateKeyBase64), out _);
    }

    public string Sign(string payload)
    {
        var signature = _key.SignData(
            Encoding.UTF8.GetBytes(payload),
            HashAlgorithmName.SHA256,
            DSASignatureFormat.Rfc3279DerSequence);

        return Convert.ToBase64String(signature);
    }

    public bool Verify(string payload, string signature)
    {
        try
        {
            return _key.VerifyData(
                Encoding.UTF8.GetBytes(payload),
                Convert.FromBase64String(signature),
                HashAlgorithmName.SHA256,
                DSASignatureFormat.Rfc3279DerSequence);
        }
        catch (Exception ex) when (ex is FormatException or CryptographicException)
        {
            return false;
        }
    }

    public void Dispose() => _key.Dispose();
}
