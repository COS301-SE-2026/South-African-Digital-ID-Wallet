using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using Infrastructure.Providers;
using Microsoft.Extensions.Configuration;

namespace tests;

public class LocalEs256SigningProviderTests
{
    private const string Kid = "test-credential-key";

    private static readonly byte[] SigningInput = Encoding.ASCII.GetBytes("header.payload");

    // Each test generates a fresh key at runtime, so no private key is ever committed.
    private static string NewPrivateKey(ECCurve curve)
    {
        using var key = ECDsa.Create(curve);
        return Convert.ToBase64String(key.ExportPkcs8PrivateKey());
    }

    private static IConfiguration CreateConfiguration(string? kid, string? privateKey)
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Signing:Credential:Kid"] = kid,
                ["Signing:Credential:PrivateKey"] = privateKey,

            }).Build();
    }

    private static LocalEs256SigningProvider CreateProvider()
    {
        return new LocalEs256SigningProvider(CreateConfiguration(Kid, NewPrivateKey(ECCurve.NamedCurves.nistP256)));
    }

    [Fact]
    public async Task SignAsync_ValidInput_ReturnsSixtyFourByteSignature()
    {
        using var provider = CreateProvider();

        var signature = await provider.SignAsync(SigningInput, CancellationToken.None);

        Assert.Equal(64, signature.Length);
    }

    [Fact]
    public async Task SignAsync_CancelledToken_ThrowsOperationCanceledException()
    {
        using var provider = CreateProvider();
        using var cancellation = new CancellationTokenSource();
        await cancellation.CancelAsync();

        await Assert.ThrowsAsync<OperationCanceledException>(() => provider.SignAsync(SigningInput, cancellation.Token));
    }

    [Fact]
    public async Task Verify_SignatureFromSameKey_ReturnsTrue()
    {
        using var provider = CreateProvider();
        var signature = await provider.SignAsync(SigningInput, CancellationToken.None);

        Assert.True(provider.Verify(SigningInput, signature));
    }

    [Fact]
    public async Task Verify_TamperedInput_ReturnsFalse()
    {
        using var provider = CreateProvider();
        var signature = await provider.SignAsync(SigningInput, CancellationToken.None);

        Assert.False(provider.Verify(Encoding.ASCII.GetBytes("header.tampered"), signature));
    }

    [Fact]
    public async Task Verify_TamperedSignature_ReturnsFalse()
    {
        using var provider = CreateProvider();
        var signature = await provider.SignAsync(SigningInput, CancellationToken.None);
        signature[10] ^= 0x01;

        Assert.False(provider.Verify(SigningInput, signature));
    }

    [Fact]
    public void Verify_SignatureNotSixtyFourBytes_ReturnsFalse()
    {
        using var provider = CreateProvider();

        Assert.False(provider.Verify(SigningInput, new byte[72]));
    }

    [Fact]
    public async Task Verify_SignatureFromDifferentKey_ReturnsFalse()
    {
        using var signer = CreateProvider();
        using var otherProvider = CreateProvider();
        var signature = await signer.SignAsync(SigningInput, CancellationToken.None);

        Assert.False(otherProvider.Verify(SigningInput, signature));
    }

    [Fact]
    public async Task GetPublicJwk_ExportedCoordinates_VerifySignatureIndependently()
    {
        using var provider = CreateProvider();
        var signature = await provider.SignAsync(SigningInput, CancellationToken.None);

        var jwk = provider.GetPublicJwk();

        // Rebuild the public key from the published coordinates only, as a phone verifier would.
        using var verifier = ECDsa.Create(new ECParameters
        {
            Curve = ECCurve.NamedCurves.nistP256,
            Q = new ECPoint { X = Base64Url.DecodeFromChars(jwk.X), Y = Base64Url.DecodeFromChars(jwk.Y) },
        });

        Assert.Equal("EC", jwk.Kty);
        Assert.Equal("P-256", jwk.Crv);
        Assert.Equal(Kid, jwk.Kid);
        Assert.True(verifier.VerifyData(SigningInput, signature, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation));
    }

    [Fact]
    public void KeyIdAndAlgorithm_ValidConfiguration_ReturnConfiguredKidAndEs256()
    {
        using var provider = CreateProvider();

        Assert.Equal(Kid, provider.KeyId);
        Assert.Equal("ES256", provider.Algorithm);
    }

    [Fact]
    public void Constructor_MissingKid_ThrowsInvalidOperationException()
    {
        var config = CreateConfiguration(null, NewPrivateKey(ECCurve.NamedCurves.nistP256));

        Assert.Throws<InvalidOperationException>(() => new LocalEs256SigningProvider(config));
    }

    [Fact]
    public void Constructor_MissingPrivateKey_ThrowsInvalidOperationException()
    {
        var config = CreateConfiguration(Kid, null);

        Assert.Throws<InvalidOperationException>(() => new LocalEs256SigningProvider(config));
    }

    [Fact]
    public void Constructor_InvalidBase64_ThrowsFormatException()
    {
        var config = CreateConfiguration(Kid, "not base64!");

        Assert.Throws<FormatException>(() => new LocalEs256SigningProvider(config));
    }

    [Fact]
    public void Constructor_P384Key_ThrowsInvalidOperationException()
    {
        var config = CreateConfiguration(Kid, NewPrivateKey(ECCurve.NamedCurves.nistP384));

        Assert.Throws<InvalidOperationException>(() => new LocalEs256SigningProvider(config));
    }
}
