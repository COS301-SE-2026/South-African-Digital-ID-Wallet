using System.Buffers.Text;
using System.Security.Cryptography;
using Azure.Core;
using Azure.Security.KeyVault.Keys;
using Infrastructure.Providers;
using Microsoft.Extensions.Configuration;

namespace tests;

public class AzureQrSigningKeyVaultInspectorTests
{
    private const string Version = "0123456789abcdef0123456789abcdef";

    private sealed class ThrowingTokenCredential : TokenCredential
    {
        public override AccessToken GetToken(TokenRequestContext requestContext, CancellationToken cancellationToken) =>
            throw new InvalidOperationException("Key Vault should not be contacted in this test.");

        public override ValueTask<AccessToken> GetTokenAsync(TokenRequestContext requestContext, CancellationToken cancellationToken) =>
            throw new InvalidOperationException("Key Vault should not be contacted in this test.");
    }

    private static KeyVaultKey CreateKey(string? version = Version, bool? enabled = true, Action<JsonWebKey>? mutate = null)
    {
        using var ecdsa = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var jwk = new JsonWebKey(ecdsa);
        mutate?.Invoke(jwk);

        var properties = KeyModelFactory.KeyProperties(name: "flashid-qr-signing-v2", version: version);
        properties.Enabled = enabled;

        return KeyModelFactory.KeyVaultKey(properties, jwk);
    }

    private static IConfiguration CreateConfiguration(string? vaultUri, string? keyName)
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AzureKeyVault:VaultUri"] = vaultUri,
                ["QrSigning:KeyName"] = keyName,
            })
            .Build();
    }

    [Fact]
    public void ToVaultKeyVersion_ValidP256Key_UsesFullVersionInKidAndMapsCoordinates()
    {
        var key = CreateKey();

        var result = AzureQrSigningKeyVaultInspector.ToVaultKeyVersion(key);

        Assert.Equal(Version, result.Version);
        Assert.Equal($"qr-key-{Version}", result.PublicJwk.Kid);
        Assert.Equal("P-256", result.PublicJwk.Crv);
        Assert.Equal(32, Base64Url.DecodeFromChars(result.PublicJwk.X).Length);
        Assert.Equal(32, Base64Url.DecodeFromChars(result.PublicJwk.Y).Length);
    }

    [Fact]
    public void ToVaultKeyVersion_MissingVersion_Throws()
    {
        var key = CreateKey(version: null);

        var ex = Assert.Throws<InvalidOperationException>(() => AzureQrSigningKeyVaultInspector.ToVaultKeyVersion(key));

        Assert.Contains("no version", ex.Message);
    }

    [Fact]
    public void ToVaultKeyVersion_DisabledKey_Throws()
    {
        var key = CreateKey(enabled: false);

        var ex = Assert.Throws<InvalidOperationException>(() => AzureQrSigningKeyVaultInspector.ToVaultKeyVersion(key));

        Assert.Contains("not enabled", ex.Message);
    }

    [Fact]
    public void ToVaultKeyVersion_NonEcKey_Throws()
    {
        var key = CreateKey(mutate: jwk => jwk.KeyType = KeyType.Rsa);

        var ex = Assert.Throws<InvalidOperationException>(() => AzureQrSigningKeyVaultInspector.ToVaultKeyVersion(key));

        Assert.Contains("expected EC", ex.Message);
    }

    [Fact]
    public void ToVaultKeyVersion_WrongCurve_Throws()
    {
        var key = CreateKey(mutate: jwk => jwk.CurveName = KeyCurveName.P384);

        var ex = Assert.Throws<InvalidOperationException>(() => AzureQrSigningKeyVaultInspector.ToVaultKeyVersion(key));

        Assert.Contains("expected P-256", ex.Message);
    }

    [Fact]
    public void ToVaultKeyVersion_InvalidCoordinateLength_Throws()
    {
        var key = CreateKey(mutate: jwk => jwk.X = new byte[16]);

        var ex = Assert.Throws<InvalidOperationException>(() => AzureQrSigningKeyVaultInspector.ToVaultKeyVersion(key));

        Assert.Contains("invalid P-256 public key coordinates", ex.Message);
    }

    [Fact]
    public void Constructor_MissingVaultUri_Throws()
    {
        var config = CreateConfiguration(vaultUri: null, keyName: "flashid-qr-signing-v2");

        var ex = Assert.Throws<InvalidOperationException>(() => new AzureQrSigningKeyVaultInspector(new ThrowingTokenCredential(), config));

        Assert.Contains("VaultUri", ex.Message);
    }

    [Fact]
    public void Constructor_MissingKeyName_Throws()
    {
        var config = CreateConfiguration(vaultUri: "https://fake-vault.vault.azure.net/", keyName: null);

        var ex = Assert.Throws<InvalidOperationException>(() => new AzureQrSigningKeyVaultInspector(new ThrowingTokenCredential(), config));

        Assert.Contains("KeyName", ex.Message);
    }
}