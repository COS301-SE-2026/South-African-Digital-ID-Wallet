using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
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

    // Checks a signature using only the published public key, exactly as a phone verifier would.
    private static bool VerifyWithPublishedKey(EcPublicJwk jwk, byte[] signingInput, byte[] signature)
    {
        using var verifier = ECDsa.Create(new ECParameters
        {
            Curve = ECCurve.NamedCurves.nistP256,
            Q = new ECPoint { X = Base64Url.DecodeFromChars(jwk.X), Y = Base64Url.DecodeFromChars(jwk.Y) },
        });

        return verifier.VerifyData(signingInput, signature, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);
    }

    [Fact]
    public async Task GetActiveKeyAsync_ValidConfiguration_ReturnsConfiguredKidAndEs256()
    {
        using var provider = CreateProvider();

        var key = await provider.GetActiveKeyAsync(CancellationToken.None);

        Assert.Equal(Kid, key.KeyId);
        Assert.Equal("ES256", key.Algorithm);
        Assert.Equal("EC", key.PublicJwk.Kty);
        Assert.Equal("P-256", key.PublicJwk.Crv);
        Assert.Equal(Kid, key.PublicJwk.Kid);
    }

    [Fact]
    public async Task GetActiveKeyAsync_PublishedKey_VerifiesSignatureIndependently()
    {
        using var provider = CreateProvider();
        var key = await provider.GetActiveKeyAsync(CancellationToken.None);

        var signature = await provider.SignAsync(key.KeyId, SigningInput, CancellationToken.None);

        Assert.True(VerifyWithPublishedKey(key.PublicJwk, SigningInput, signature));
    }

    [Fact]
    public async Task GetActiveKeyAsync_CancelledToken_ThrowsOperationCanceledException()
    {
        using var provider = CreateProvider();
        using var cancellation = new CancellationTokenSource();
        await cancellation.CancelAsync();

        await Assert.ThrowsAsync<OperationCanceledException>(() => provider.GetActiveKeyAsync(cancellation.Token));
    }

    [Fact]
    public async Task SignAsync_ActiveKeyId_ReturnsSixtyFourByteSignature()
    {
        using var provider = CreateProvider();
        var key = await provider.GetActiveKeyAsync(CancellationToken.None);

        var signature = await provider.SignAsync(key.KeyId, SigningInput, CancellationToken.None);

        Assert.Equal(64, signature.Length);
    }

    [Fact]
    public async Task SignAsync_UnknownKeyId_ThrowsInvalidOperationException()
    {
        using var provider = CreateProvider();

        await Assert.ThrowsAsync<InvalidOperationException>(() => provider.SignAsync("retired-key", SigningInput, CancellationToken.None));
    }

    [Fact]
    public async Task SignAsync_CancelledToken_ThrowsOperationCanceledException()
    {
        using var provider = CreateProvider();
        using var cancellation = new CancellationTokenSource();
        await cancellation.CancelAsync();

        await Assert.ThrowsAsync<OperationCanceledException>(() => provider.SignAsync(Kid, SigningInput, cancellation.Token));
    }

    [Fact]
    public async Task Signature_TamperedInput_FailsVerification()
    {
        using var provider = CreateProvider();
        var key = await provider.GetActiveKeyAsync(CancellationToken.None);
        var signature = await provider.SignAsync(key.KeyId, SigningInput, CancellationToken.None);

        Assert.False(VerifyWithPublishedKey(key.PublicJwk, Encoding.ASCII.GetBytes("header.tampered"), signature));
    }

    [Fact]
    public async Task Signature_TamperedSignature_FailsVerification()
    {
        using var provider = CreateProvider();
        var key = await provider.GetActiveKeyAsync(CancellationToken.None);
        var signature = await provider.SignAsync(key.KeyId, SigningInput, CancellationToken.None);
        signature[10] ^= 0x01;

        Assert.False(VerifyWithPublishedKey(key.PublicJwk, SigningInput, signature));
    }

    [Fact]
    public async Task Signature_FromDifferentProvider_FailsVerification()
    {
        using var signer = CreateProvider();
        using var other = CreateProvider();
        var signerKey = await signer.GetActiveKeyAsync(CancellationToken.None);
        var otherKey = await other.GetActiveKeyAsync(CancellationToken.None);
        var signature = await signer.SignAsync(signerKey.KeyId, SigningInput, CancellationToken.None);

        Assert.False(VerifyWithPublishedKey(otherKey.PublicJwk, SigningInput, signature));
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
