using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public class AesFieldCryptoProvider : IFieldCryptoProvider
{
    private const byte CurrentVersion = 1;
    private const int NonceSize = 12;
    private const int TagSize = 16;
    private readonly byte[] _key;

    public AesFieldCryptoProvider(IConfiguration config)
    {
        var keyBase64 = config["Emergency:FieldEncryptionKey"]
            ?? throw new InvalidOperationException("Emergency field encryption key not configured.");

        _key = Convert.FromBase64String(keyBase64);
        if (_key.Length != 32)
            throw new InvalidOperationException("Emergency field encryption key must be 32 bytes.");
    }

    public string Encrypt(string plaintext, string context)
    {
        var plainBytes = Encoding.UTF8.GetBytes(plaintext);
        var nonce = RandomNumberGenerator.GetBytes(NonceSize);
        var tag = new byte[TagSize];
        var cipher = new byte[plainBytes.Length];

        using var aes = new AesGcm(_key, TagSize);
        aes.Encrypt(nonce, plainBytes, cipher, tag, AssociatedData(context));

        var output = new byte[1 + NonceSize + TagSize + cipher.Length];
        output[0] = CurrentVersion;
        nonce.CopyTo(output, 1);
        tag.CopyTo(output, 1 + NonceSize);
        cipher.CopyTo(output, 1 + NonceSize + TagSize);
        return Convert.ToBase64String(output);
    }

    public string Decrypt(string ciphertext, string context)
    {
        var raw = Convert.FromBase64String(ciphertext);

        if (raw.Length >= 1 + NonceSize + TagSize && raw[0] == CurrentVersion)
        {
            try
            {
                return Open(raw.AsSpan(1), AssociatedData(context));
            }
            catch (CryptographicException)
            {
            }
        }

        return Open(raw, []);
    }

    private string Open(ReadOnlySpan<byte> sealedBytes, byte[] associatedData)
    {
        if (sealedBytes.Length < NonceSize + TagSize)
        {
            throw new CryptographicException("Emergency field ciphertext is malformed.");
        }

        var nonce = sealedBytes[..NonceSize];
        var tag = sealedBytes.Slice(NonceSize, TagSize);
        var cipher = sealedBytes[(NonceSize + TagSize)..];
        var plain = new byte[cipher.Length];

        using var aes = new AesGcm(_key, TagSize);
        aes.Decrypt(nonce, cipher, tag, plain, associatedData);
        return Encoding.UTF8.GetString(plain);
    }

    private static byte[] AssociatedData(string context) => Encoding.UTF8.GetBytes($"flashid-emergency-field:{context}");
}
