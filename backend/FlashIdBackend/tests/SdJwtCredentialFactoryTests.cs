using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;
using Application.Features.Credentials.Enums;

namespace tests;

public class SdJwtCredentialFactoryTests
{
    private static readonly DateTimeOffset Now = new(2026, 9, 18, 10, 0, 0, TimeSpan.Zero);

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private static SdJwtCredentialFactory CreateFactory(TestSigningProvider signingProvider) =>
        new(signingProvider, new FixedTimeProvider(Now));

    private static JsonObject Header(SdJwtCredential credential) => Segment(credential, 0);

    private static JsonObject Payload(SdJwtCredential credential) => Segment(credential, 1);

    private static JsonObject Segment(SdJwtCredential credential, int index)
    {
        var segment = credential.IssuerJwt.Split('.')[index];
        return JsonNode.Parse(Encoding.UTF8.GetString(Base64Url.DecodeFromChars(segment)))!.AsObject();
    }

    private static string Digest(string disclosure) =>
        Base64Url.EncodeToString(SHA256.HashData(Encoding.ASCII.GetBytes(disclosure)));

    private static string[] DisclosureParts(string disclosure) =>
        JsonNode.Parse(Encoding.UTF8.GetString(Base64Url.DecodeFromChars(disclosure)))!.AsArray()
            .Select(node => node!.GetValue<string>())
            .ToArray();

    [Fact]
    public async Task CreateAsync_ValidRequest_SignatureVerifiesWithTheIssuerKey()
    {
        using var signingProvider = new TestSigningProvider();
        var credential = await CreateFactory(signingProvider).CreateAsync(new SdJwtCredentialRequestBuilder().Build(), CancellationToken.None);

        var segments = credential.IssuerJwt.Split('.');
        var signature = Base64Url.DecodeFromChars(segments[2]);

        Assert.Equal(64, signature.Length);
        Assert.True(signingProvider.Verify($"{segments[0]}.{segments[1]}", signature));
    }

    [Fact]
    public async Task CreateAsync_ValidRequest_HeaderMatchesWireFormatSection6()
    {
        using var signingProvider = new TestSigningProvider();
        var credential = await CreateFactory(signingProvider).CreateAsync(new SdJwtCredentialRequestBuilder().Build(), CancellationToken.None);

        var header = Header(credential);

        Assert.Equal("ES256", header["alg"]!.GetValue<string>());
        Assert.Equal("dc+sd-jwt", header["typ"]!.GetValue<string>());
        Assert.Equal("test-key-1", header["kid"]!.GetValue<string>());
    }

    [Fact]
    public async Task CreateAsync_ValidRequest_PayloadMatchesWireFormatSection6()
    {
        using var signingProvider = new TestSigningProvider();
        var request = new SdJwtCredentialRequestBuilder().WithRevocationIndex(4242).Build();

        var credential = await CreateFactory(signingProvider).CreateAsync(request, CancellationToken.None);
        var payload = Payload(credential);

        Assert.Equal("flashid", payload["iss"]!.GetValue<string>());
        Assert.Equal(SdJwtClaimNames.DriversLicenseVct, payload["vct"]!.GetValue<string>());
        Assert.Equal(Now.ToUnixTimeSeconds(), payload["iat"]!.GetValue<long>());
        Assert.Equal(4242, payload["ri"]!.GetValue<long>());
        Assert.Equal("sha-256", payload["_sd_alg"]!.GetValue<string>());
        Assert.Equal(request.Claims.Count, payload["_sd"]!.AsArray().Count);
    }

    [Fact]
    public async Task CreateAsync_ValidRequest_EveryDisclosureDigestIsInSd()
    {
        using var signingProvider = new TestSigningProvider();
        var credential = await CreateFactory(signingProvider).CreateAsync(new SdJwtCredentialRequestBuilder().Build(), CancellationToken.None);

        var digests = Payload(credential)["_sd"]!.AsArray().Select(node => node!.GetValue<string>()).ToHashSet();

        Assert.All(credential.Disclosures.Values, disclosure => Assert.Contains(Digest(disclosure), digests));
    }

    [Fact]
    public async Task CreateAsync_DisclosureValueTampered_DigestNoLongerMatches()
    {
        using var signingProvider = new TestSigningProvider();
        var credential = await CreateFactory(signingProvider).CreateAsync(new SdJwtCredentialRequestBuilder().Build(), CancellationToken.None);

        var original = credential.Disclosures[SdJwtClaimNames.FullName];
        var parts = DisclosureParts(original);
        var tampered = Base64Url.EncodeToString(Encoding.UTF8.GetBytes($"[\"{parts[0]}\",\"{parts[1]}\",\"Someone Else\"]"));

        var digests = Payload(credential)["_sd"]!.AsArray().Select(node => node!.GetValue<string>()).ToHashSet();

        Assert.Contains(Digest(original), digests);
        Assert.DoesNotContain(Digest(tampered), digests);
    }

    [Fact]
    public async Task CreateAsync_ValidRequest_ClaimValuesAreNotReadableInTheIssuerJwt()
    {
        using var signingProvider = new TestSigningProvider();
        var credential = await CreateFactory(signingProvider).CreateAsync(new SdJwtCredentialRequestBuilder().Build(), CancellationToken.None);

        var payloadText = Payload(credential).ToJsonString();

        Assert.DoesNotContain("Thabo", payloadText, StringComparison.Ordinal);
        Assert.DoesNotContain("1998-03-14", payloadText, StringComparison.Ordinal);
    }

    [Fact]
    public async Task CreateAsync_SameClaimsTwice_ProducesDifferentSalts()
    {
        using var signingProvider = new TestSigningProvider();
        var factory = CreateFactory(signingProvider);

        var first = await factory.CreateAsync(new SdJwtCredentialRequestBuilder().Build(), CancellationToken.None);
        var second = await factory.CreateAsync(new SdJwtCredentialRequestBuilder().Build(), CancellationToken.None);

        var firstSalt = DisclosureParts(first.Disclosures[SdJwtClaimNames.FullName])[0];
        var secondSalt = DisclosureParts(second.Disclosures[SdJwtClaimNames.FullName])[0];

        Assert.NotEqual(firstSalt, secondSalt);
    }

    [Fact]
    public async Task CreateAsync_ManyClaims_DigestOrderIsShuffled()
    {
        using var signingProvider = new TestSigningProvider();
        var factory = CreateFactory(signingProvider);
        var request = new SdJwtCredentialRequestBuilder()
            .WithClaim(SdJwtClaimNames.IdentityNumber, "0000000000000")
            .WithClaim(SdJwtClaimNames.LicenseNumber, "FAKE-1234")
            .WithClaim(SdJwtClaimNames.LicenseCode, "B")
            .WithClaim(SdJwtClaimNames.CountryOfIssue, "ZA")
            .WithClaim(SdJwtClaimNames.VehicleRestrictions, "0")
            .WithClaim(SdJwtClaimNames.IssueDate, "2024-01-15")
            .Build();

        // Random shuffling can leave one run in claim order, so the test fails only if every run does.
        var shuffledAtLeastOnce = false;
        for (var attempt = 0; attempt < 5 && !shuffledAtLeastOnce; attempt++)
        {
            var credential = await factory.CreateAsync(request, CancellationToken.None);
            var digestsInPayload = Payload(credential)["_sd"]!.AsArray().Select(node => node!.GetValue<string>()).ToList();
            var digestsInClaimOrder = credential.Disclosures.Values.Select(Digest).ToList();

            shuffledAtLeastOnce = !digestsInPayload.SequenceEqual(digestsInClaimOrder);
        }

        Assert.True(shuffledAtLeastOnce);
    }

    [Fact]
    public async Task CreateAsync_DocumentExpiresBeforeTheCap_UsesTheDocumentExpiry()
    {
        using var signingProvider = new TestSigningProvider();
        var documentExpiry = Now.AddDays(10);

        var credential = await CreateFactory(signingProvider)
            .CreateAsync(new SdJwtCredentialRequestBuilder().WithDocumentExpiry(documentExpiry).Build(), CancellationToken.None);

        Assert.Equal(documentExpiry, credential.ExpiresAt);
        Assert.Equal(documentExpiry.ToUnixTimeSeconds(), Payload(credential)["exp"]!.GetValue<long>());
    }

    [Fact]
    public async Task CreateAsync_DocumentExpiresAfterTheCap_UsesThirtyDayCap()
    {
        using var signingProvider = new TestSigningProvider();

        var credential = await CreateFactory(signingProvider)
            .CreateAsync(new SdJwtCredentialRequestBuilder().WithDocumentExpiry(Now.AddYears(4)).Build(), CancellationToken.None);

        Assert.Equal(Now.AddDays(30), credential.ExpiresAt);
    }

    [Fact]
    public async Task CreateAsync_NoDocumentExpiry_UsesThirtyDayCap()
    {
        using var signingProvider = new TestSigningProvider();

        var credential = await CreateFactory(signingProvider).CreateAsync(new SdJwtCredentialRequestBuilder().Build(), CancellationToken.None);

        Assert.Equal(Now.AddDays(30), credential.ExpiresAt);
    }

    [Fact]
    public async Task CreateAsync_DocumentAlreadyExpired_ThrowsInvalidOperationException()
    {
        using var signingProvider = new TestSigningProvider();
        var request = new SdJwtCredentialRequestBuilder().WithDocumentExpiry(Now.AddDays(-1)).Build();

        await Assert.ThrowsAsync<InvalidOperationException>(() => CreateFactory(signingProvider).CreateAsync(request, CancellationToken.None));
    }

    [Fact]
    public async Task CreateAsync_MissingMandatoryClaim_ThrowsArgumentException()
    {
        using var signingProvider = new TestSigningProvider();
        var request = new SdJwtCredentialRequestBuilder().WithoutClaim(SdJwtClaimNames.Portrait).Build();

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => CreateFactory(signingProvider).CreateAsync(request, CancellationToken.None));

        Assert.Contains(SdJwtClaimNames.Portrait, exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task CreateAsync_BlankVct_ThrowsArgumentException()
    {
        using var signingProvider = new TestSigningProvider();
        var request = new SdJwtCredentialRequestBuilder().WithVct("  ").Build();

        await Assert.ThrowsAsync<ArgumentException>(() => CreateFactory(signingProvider).CreateAsync(request, CancellationToken.None));
    }

    [Fact]
    public async Task CreateAsync_NoClaims_ThrowsArgumentException()
    {
        using var signingProvider = new TestSigningProvider();
        var request = new SdJwtCredentialRequestBuilder().WithOnlyClaims().WithMandatoryClaimNames().Build();

        await Assert.ThrowsAsync<ArgumentException>(() => CreateFactory(signingProvider).CreateAsync(request, CancellationToken.None));
    }

    [Fact]
    public async Task CreateAsync_NegativeRevocationIndex_ThrowsArgumentException()
    {
        using var signingProvider = new TestSigningProvider();
        var request = new SdJwtCredentialRequestBuilder().WithRevocationIndex(-1).Build();

        await Assert.ThrowsAsync<ArgumentException>(() => CreateFactory(signingProvider).CreateAsync(request, CancellationToken.None));
    }

    [Fact]
    public async Task CreateAsync_BlankClaimName_ThrowsArgumentException()
    {
        using var signingProvider = new TestSigningProvider();
        var request = new SdJwtCredentialRequestBuilder().WithClaim(" ", "value").Build();

        await Assert.ThrowsAsync<ArgumentException>(() => CreateFactory(signingProvider).CreateAsync(request, CancellationToken.None));
    }

    [Fact]
    public async Task CreateAsync_NullRequest_ThrowsArgumentNullException()
    {
        using var signingProvider = new TestSigningProvider();

        await Assert.ThrowsAsync<ArgumentNullException>(() => CreateFactory(signingProvider).CreateAsync(null!, CancellationToken.None));
    }

    [Fact]
    public async Task CreateAsync_DeviceKeyProvided_PayloadCarriesCnfJwk()
    {
        using var signingProvider = new TestSigningProvider();
        var deviceKey = new EcPublicJwk("EC", "P-256", "device-1", "eA", "eQ");

        var credential = await CreateFactory(signingProvider)
            .CreateAsync(new SdJwtCredentialRequestBuilder().WithDeviceKey(deviceKey).Build(), CancellationToken.None);

        var jwk = Payload(credential)["cnf"]!["jwk"]!.AsObject();

        Assert.Equal("EC", jwk["kty"]!.GetValue<string>());
        Assert.Equal("P-256", jwk["crv"]!.GetValue<string>());
        Assert.Equal("eA", jwk["x"]!.GetValue<string>());
        Assert.Equal("eQ", jwk["y"]!.GetValue<string>());
    }

    [Fact]
    public async Task CreateAsync_NoDeviceKey_PayloadHasNoCnf()
    {
        using var signingProvider = new TestSigningProvider();

        var credential = await CreateFactory(signingProvider).CreateAsync(new SdJwtCredentialRequestBuilder().Build(), CancellationToken.None);

        Assert.False(Payload(credential).ContainsKey("cnf"));
    }

    [Fact]
    public async Task CreateAsync_Always_SignsWithTheActiveKeyId()
    {
        using var signingProvider = new TestSigningProvider();

        var credential = await CreateFactory(signingProvider).CreateAsync(new SdJwtCredentialRequestBuilder().Build(), CancellationToken.None);

        Assert.Equal("test-key-1", credential.KeyId);
        Assert.Equal("test-key-1", signingProvider.LastSignedWithKeyId);
        Assert.Equal("test-key-1", Header(credential)["kid"]!.GetValue<string>());
    }

    [Fact]
    public async Task ToSdJwt_Credential_EndsWithTildeAndCarriesEveryDisclosure()
    {
        using var signingProvider = new TestSigningProvider();
        var credential = await CreateFactory(signingProvider).CreateAsync(new SdJwtCredentialRequestBuilder().Build(), CancellationToken.None);

        var sdJwt = credential.ToSdJwt();

        Assert.StartsWith(credential.IssuerJwt, sdJwt, StringComparison.Ordinal);
        Assert.EndsWith("~", sdJwt, StringComparison.Ordinal);
        Assert.Equal(credential.Disclosures.Count + 1, sdJwt.Split('~').Length - 1);
        Assert.All(credential.Disclosures.Values, disclosure => Assert.Contains(disclosure, sdJwt, StringComparison.Ordinal));
    }
}
