using System.Security.Cryptography;
using Application.Common.Interfaces.ProviderInterfaces;
using Infrastructure.Providers;
using Microsoft.Extensions.Configuration;

namespace tests;

public class AesFieldCryptoProviderTests
{
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

        Assert.Equal(plaintext, provider.Decrypt(provider.Encrypt(plaintext)));
    }

    [Fact]
    public void Encrypt_SameInputTwice_ProducesDifferentCiphertext()
    {
        var provider = Provider();

        Assert.NotEqual(provider.Encrypt("O negative"), provider.Encrypt("O negative"));
    }

    [Fact]
    public void Decrypt_WithDifferentKey_Throws()
    {
        var cipher = Provider(new byte[32]).Encrypt("O negative");
        var otherKey = Enumerable.Repeat((byte)7, 32).ToArray();

        Assert.ThrowsAny<CryptographicException>(() => Provider(otherKey).Decrypt(cipher));
    }

    [Fact]
    public void Decrypt_TamperedCiphertext_Throws()
    {
        var provider = Provider();
        var blob = Convert.FromBase64String(provider.Encrypt("O negative"));
        blob[^1] ^= 0xFF;

        Assert.ThrowsAny<CryptographicException>(() => provider.Decrypt(Convert.ToBase64String(blob)));
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
}
