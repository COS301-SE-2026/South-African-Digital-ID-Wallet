using System.Buffers.Text;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Services;

namespace tests;

public class CrossStackFixtureTests
{
    private static readonly string[] DisclosedClaimNames =
    [
        SdJwtClaimNames.Portrait,
        SdJwtClaimNames.ExpiryDate,
        SdJwtClaimNames.DateOfBirth,
        SdJwtClaimNames.FullName,
    ];

    private static readonly JsonSerializerOptions FixtureJsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    public sealed record Fixture(
        string Version,
        string Note,
        string GeneratedAt,
        long VerifyAtUnix,
        IReadOnlyList<EcPublicJwk> IssuerKeys,
        string Presentation,
        Expectation Expected);

    public sealed record Expectation(
        string Vct,
        long RevocationIndex,
        IReadOnlyDictionary<string, string> Claims,
        int HiddenClaimCount);

    // Resolves the source folder at compile time, so the same path works for reading in CI and for
    // rewriting the file during regeneration.
    private static string FixturePath([CallerFilePath] string callerFilePath = "") =>
        Path.Combine(Path.GetDirectoryName(callerFilePath)!, "TestData", "offline-verification", "cross-stack-fixture.json");

    private static Fixture LoadFixture() =>
        JsonSerializer.Deserialize<Fixture>(File.ReadAllText(RequireFixturePath()), FixtureJsonOptions)!;

    private static (string IssuerJwt, string[] Disclosures) SplitPresentation(string presentation)
    {
        var parts = presentation.Split('~');
        return (parts[0], parts[1..^1]);
    }

    private static JsonObject Segment(string segment) =>
        JsonNode.Parse(Encoding.UTF8.GetString(Base64Url.DecodeFromChars(segment)))!.AsObject();

    private static string Digest(string disclosure) =>
        Base64Url.EncodeToString(SHA256.HashData(Encoding.ASCII.GetBytes(disclosure)));

    private static ECDsa KeyFrom(EcPublicJwk jwk) => ECDsa.Create(new ECParameters
    {
        Curve = ECCurve.NamedCurves.nistP256,
        Q = new ECPoint
        {
            X = Base64Url.DecodeFromChars(jwk.X),
            Y = Base64Url.DecodeFromChars(jwk.Y),
        },
    });

    private static string RequireFixturePath()
    {
        var path = FixturePath();

        // During a regeneration running the generator may not have written the file yet, so skip instead of failing.
        Assert.SkipWhen(
            !File.Exists(path) && Environment.GetEnvironmentVariable("FLASHID_UPDATE_FIXTURE") == "1",
            "Regenerating the fixture. Re-run without FLASHID_UPDATE_FIXTURE to verify it.");

        Assert.True(File.Exists(path), $"Cross-stack fixture missing at {path}. Generate it with FLASHID_UPDATE_FIXTURE=1.");

        return path;
    }

    [Fact]
    public void Fixture_Presentation_IsWellFormed()
    {
        var fixture = LoadFixture();

        Assert.EndsWith("~", fixture.Presentation, StringComparison.Ordinal);

        var (issuerJwt, disclosures) = SplitPresentation(fixture.Presentation);

        Assert.Equal(3, issuerJwt.Split('.').Length);
        Assert.Equal(DisclosedClaimNames.Length, disclosures.Length);
        Assert.False(string.IsNullOrWhiteSpace(fixture.Note));
    }

    [Fact]
    public void Fixture_IssuerSignature_VerifiesWithThePublishedKey()
    {
        var fixture = LoadFixture();
        var (issuerJwt, _) = SplitPresentation(fixture.Presentation);
        var segments = issuerJwt.Split('.');

        var kid = Segment(segments[0])["kid"]!.GetValue<string>();
        var jwk = fixture.IssuerKeys.Single(key => key.Kid == kid);

        using var key = KeyFrom(jwk);
        var signature = Base64Url.DecodeFromChars(segments[2]);

        Assert.Equal(64, signature.Length);
        Assert.True(key.VerifyData(
            Encoding.ASCII.GetBytes($"{segments[0]}.{segments[1]}"),
            signature,
            HashAlgorithmName.SHA256,
            DSASignatureFormat.IeeeP1363FixedFieldConcatenation));
    }

    [Fact]
    public void Fixture_DisclosedClaims_MatchTheExpectedValues()
    {
        var fixture = LoadFixture();
        var (_, disclosures) = SplitPresentation(fixture.Presentation);

        var claims = disclosures
            .Select(disclosure => JsonNode.Parse(Encoding.UTF8.GetString(Base64Url.DecodeFromChars(disclosure)))!.AsArray())
            .ToDictionary(parts => parts[1]!.GetValue<string>(), parts => parts[2]!.GetValue<string>(), StringComparer.Ordinal);

        Assert.Equal(fixture.Expected.Claims.OrderBy(p => p.Key), claims.OrderBy(p => p.Key));
    }

    [Fact]
    public void Fixture_EveryDisclosureDigest_IsInSd()
    {
        var fixture = LoadFixture();
        var (issuerJwt, disclosures) = SplitPresentation(fixture.Presentation);
        var payload = Segment(issuerJwt.Split('.')[1]);

        var digests = payload["_sd"]!.AsArray().Select(node => node!.GetValue<string>()).ToHashSet();

        Assert.All(disclosures, disclosure => Assert.Contains(Digest(disclosure), digests));
        Assert.Equal(fixture.Expected.HiddenClaimCount, digests.Count - disclosures.Length);
    }

    [Fact]
    public void Fixture_Payload_MatchesTheExpectedCredential()
    {
        var fixture = LoadFixture();
        var (issuerJwt, _) = SplitPresentation(fixture.Presentation);
        var payload = Segment(issuerJwt.Split('.')[1]);

        Assert.Equal(fixture.Expected.Vct, payload["vct"]!.GetValue<string>());
        Assert.Equal(fixture.Expected.RevocationIndex, payload["ri"]!.GetValue<long>());
        Assert.Equal("urn:flashid:issuer", payload["iss"]!.GetValue<string>());
        Assert.Equal(fixture.VerifyAtUnix + (long)TimeSpan.FromDays(30).TotalSeconds, payload["exp"]!.GetValue<long>());
    }

    [Fact]
    public void Fixture_HiddenClaimValues_AreNotPresentInTheFile()
    {
        var json = File.ReadAllText(RequireFixturePath());

        Assert.DoesNotContain("FAKE-1234", json, StringComparison.Ordinal);
        Assert.DoesNotContain("0000000000000", json, StringComparison.Ordinal);
    }

    [Fact]
    public void Fixture_File_ContainsNoPrivateKeyMaterial()
    {
        var json = File.ReadAllText(RequireFixturePath());

        Assert.DoesNotContain("\"d\"", json, StringComparison.Ordinal);
        Assert.DoesNotContain("PRIVATE KEY", json, StringComparison.Ordinal);
    }

    [Fact]
    public async Task RegenerateFixture_WhenExplicitlyRequested_WritesTheFile()
    {
        Assert.SkipUnless(
            Environment.GetEnvironmentVariable("FLASHID_UPDATE_FIXTURE") == "1",
            "Set FLASHID_UPDATE_FIXTURE=1 to regenerate the cross-stack fixture.");

        using var signingProvider = new TestSigningProvider();
        var factory = new SdJwtCredentialFactory(signingProvider, TimeProvider.System);

        var request = new SdJwtCredentialRequestBuilder()
            .WithRevocationIndex(4242)
            .WithClaim(SdJwtClaimNames.IdentityNumber, "0000000000000")
            .WithClaim(SdJwtClaimNames.LicenseNumber, "FAKE-1234")
            .WithClaim(SdJwtClaimNames.LicenseCode, "B")
            .Build();

        var credential = await factory.CreateAsync(request, TestContext.Current.CancellationToken);

        var presentation = credential.IssuerJwt
            + "~"
            + string.Join("~", DisclosedClaimNames.Select(name => credential.Disclosures[name]))
            + "~";

        var fixture = new Fixture(
            "1.0",
            "Verifiers must pin their clock to verifyAtUnix. The exp is 30 days after generation, so checking against the real clock will fail once that window passes, which looks like a verifier bug but is a stale fixture. Regenerate with FLASHID_UPDATE_FIXTURE=1.",
            credential.IssuedAt.ToString("O"),
            credential.IssuedAt.ToUnixTimeSeconds(),
            [signingProvider.ActiveKey.PublicJwk],
            presentation,
            new Expectation(
                request.Vct,
                request.RevocationIndex,
                DisclosedClaimNames.ToDictionary(name => name, name => request.Claims[name], StringComparer.Ordinal),
                request.Claims.Count - DisclosedClaimNames.Length));

        var path = FixturePath();
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(fixture, FixtureJsonOptions), TestContext.Current.CancellationToken);
    }
}
