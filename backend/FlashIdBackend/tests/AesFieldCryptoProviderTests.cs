using System.Security.Cryptography;
using Application.Common.Interfaces.ProviderInterfaces;
using Infrastructure.Providers;
using Microsoft.Extensions.Configuration;

namespace tests;

public class AesFieldCryptoProviderTests
{
    private const string FieldContext = "profile-1/bloodType";

    private static IConfiguration Config(string? key) =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Emergency:FieldEncryptionKey"] = key,
            })
            .Build();

    private static IFieldCryptoProvider Provider(byte[]? rawKey = null) =>
        new AesFieldCryptoProvider(Config(Convert.ToBase64String(rawKey ?? new byte[32])));

    [Theory]
    [InlineData("O negative")]
    [InlineData("Penicillin, latex")]
    [InlineData("")]
    [InlineData("Ekhaya eGoli — umuntu")]
    public void EncryptThenDecrypt_ReturnsOriginal(string plaintext)
    {
        var provider = Provider();

        Assert.Equal(plaintext, provider.Decrypt(provider.Encrypt(plaintext, FieldContext), FieldContext));
    }

    [Fact]
    public void Encrypt_SameInputTwice_ProducesDifferentCiphertext()
    {
        var provider = Provider();

        Assert.NotEqual(provider.Encrypt("O negative", FieldContext), provider.Encrypt("O negative", FieldContext));
    }

    [Fact]
    public void Decrypt_WithDifferentKey_Throws()
    {
        var cipher = Provider(new byte[32]).Encrypt("O negative", FieldContext);
        var otherKey = Enumerable.Repeat((byte)7, 32).ToArray();

        Assert.ThrowsAny<CryptographicException>(() => Provider(otherKey).Decrypt(cipher, FieldContext));
    }

    [Fact]
    public void Decrypt_TamperedCiphertext_Throws()
    {
        var provider = Provider();
        var blob = Convert.FromBase64String(provider.Encrypt("O negative", FieldContext));
        blob[^1] ^= 0xFF;

        Assert.ThrowsAny<CryptographicException>(() => provider.Decrypt(Convert.ToBase64String(blob), FieldContext));
    }

    [Fact]
    public void Constructor_MissingKey_Throws()
    {
        Assert.Throws<InvalidOperationException>(() => new AesFieldCryptoProvider(Config(null)));
    }

    [Fact]
    public void Constructor_WrongKeyLength_Throws()
    {
        var shortKey = Convert.ToBase64String(new byte[16]);

        Assert.Throws<InvalidOperationException>(() => new AesFieldCryptoProvider(Config(shortKey)));
    }

    [Fact]
    public void Decrypt_CiphertextMovedToAnotherProfileOrField_Throws()
    {
        var provider = Provider();
        var cipher = provider.Encrypt("O negative", "profile-1/bloodType");

        Assert.ThrowsAny<CryptographicException>(() => provider.Decrypt(cipher, "profile-2/bloodType"));
        Assert.ThrowsAny<CryptographicException>(() => provider.Decrypt(cipher, "profile-1/allergies"));
    }

    [Fact]
    public void Encrypt_StartsWithAKeyVersion()
    {
        Assert.Equal(1, Convert.FromBase64String(Provider().Encrypt("O negative", FieldContext))[0]);
    }

    [Fact]
    public void Decrypt_ReadsCiphertextWrittenBeforeVersioning()
    {
        var key = new byte[32];
        var nonce = new byte[12];
        nonce[0] = 7;
        var plain = System.Text.Encoding.UTF8.GetBytes("O negative");
        var cipher = new byte[plain.Length];
        var tag = new byte[16];
        using (var aes = new AesGcm(key, 16))
        {
            aes.Encrypt(nonce, plain, cipher, tag);
        }

        var legacy = Convert.ToBase64String([.. nonce, .. tag, .. cipher]);

        Assert.Equal("O negative", Provider(key).Decrypt(legacy, FieldContext));
    }
}
