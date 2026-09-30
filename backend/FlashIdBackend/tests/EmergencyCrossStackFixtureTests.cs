using System.Buffers.Text;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;

namespace tests;

public class EmergencyCrossStackFixtureTests
{
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
        IReadOnlyDictionary<string, string> Claims);

    private static string FixturePath([CallerFilePath] string callerFilePath = "") =>
        Path.Combine(Path.GetDirectoryName(callerFilePath)!, "TestData", "offline-verification", "emergency-cross-stack-fixture.json");

    private static string RequireFixturePath()
    {
        var path = FixturePath();

        Assert.SkipWhen(
            !File.Exists(path) && Environment.GetEnvironmentVariable("FLASHID_UPDATE_FIXTURE") == "1",
            "Regenerating the fixture. Re-run without FLASHID_UPDATE_FIXTURE to verify it.");

        Assert.True(File.Exists(path), $"Emergency cross-stack fixture missing at {path}. Generate it with FLASHID_UPDATE_FIXTURE=1.");

        return path;
    }

    private static Fixture LoadFixture() =>
        JsonSerializer.Deserialize<Fixture>(File.ReadAllText(RequireFixturePath()), FixtureJsonOptions)!;

    private static JsonObject Segment(string segment) =>
        JsonNode.Parse(Encoding.UTF8.GetString(Base64Url.DecodeFromChars(segment)))!.AsObject();

    private static (string SdJwt, string KeyBindingJwt) Split(string presentation)
    {
        var lastTilde = presentation.LastIndexOf('~');
        return (presentation[..(lastTilde + 1)], presentation[(lastTilde + 1)..]);
    }

    private static string Encode(JsonObject json) =>
        Base64Url.EncodeToString(Encoding.UTF8.GetBytes(json.ToJsonString()));

    internal static string KeyBindingJwt(string sdJwt, ECDsa deviceKey, long issuedAt)
    {
        var header = Encode(new JsonObject { ["alg"] = "ES256", ["typ"] = "kb+jwt" });
        var payload = Encode(new JsonObject
        {
            ["iat"] = issuedAt,
            ["sd_hash"] = Base64Url.EncodeToString(SHA256.HashData(Encoding.ASCII.GetBytes(sdJwt))),
        });

        var signingInput = $"{header}.{payload}";
        var signature = deviceKey.SignData(
            Encoding.ASCII.GetBytes(signingInput),
            HashAlgorithmName.SHA256,
            DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

        return $"{signingInput}.{Base64Url.EncodeToString(signature)}";
    }

    [Fact]
    public void Fixture_Payload_IsAnEmergencyCredentialInTheEmergencyRange()
    {
        var fixture = LoadFixture();
        var (sdJwt, _) = Split(fixture.Presentation);
        var payload = Segment(sdJwt.Split('~')[0].Split('.')[1]);

        Assert.Equal(EmergencyClaimNames.Vct, payload["vct"]!.GetValue<string>());
        Assert.True(payload["ri"]!.GetValue<long>() >= EmergencyClaimNames.RevocationIndexOffset);
        Assert.NotNull(payload["cnf"]?["jwk"]);
    }

    [Fact]
    public void Fixture_KeyBinding_IsSignedByTheBoundDeviceKey()
    {
        var fixture = LoadFixture();
        var (sdJwt, keyBindingJwt) = Split(fixture.Presentation);
        var jwk = Segment(sdJwt.Split('~')[0].Split('.')[1])["cnf"]!["jwk"]!;

        using var deviceKey = ECDsa.Create(new ECParameters
        {
            Curve = ECCurve.NamedCurves.nistP256,
            Q = new ECPoint
            {
                X = Base64Url.DecodeFromChars(jwk["x"]!.GetValue<string>()),
                Y = Base64Url.DecodeFromChars(jwk["y"]!.GetValue<string>()),
            },
        });

        var segments = keyBindingJwt.Split('.');
        Assert.Equal("kb+jwt", Segment(segments[0])["typ"]!.GetValue<string>());
        Assert.True(deviceKey.VerifyData(
            Encoding.ASCII.GetBytes($"{segments[0]}.{segments[1]}"),
            Base64Url.DecodeFromChars(segments[2]),
            HashAlgorithmName.SHA256,
            DSASignatureFormat.IeeeP1363FixedFieldConcatenation));
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
            "Set FLASHID_UPDATE_FIXTURE=1 to regenerate the emergency cross-stack fixture.");

        using var signingProvider = new TestSigningProvider();
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var point = deviceKey.ExportParameters(false).Q;

        var claims = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            [EmergencyClaimNames.FullName] = "Thandiwe Dlamini",
            [EmergencyClaimNames.BloodType] = "O negative",
            [EmergencyClaimNames.Allergies] = "Penicillin",
            [EmergencyClaimNames.MedicalUpdatedOn] = "2026-09-01",
        };

        var credential = await new SdJwtCredentialFactory(signingProvider, TimeProvider.System).CreateAsync(
            new SdJwtCredentialRequest
            {
                Vct = EmergencyClaimNames.Vct,
                Claims = claims,
                MandatoryClaimNames = EmergencyClaimNames.MandatoryClaims,
                RevocationIndex = EmergencyClaimNames.RevocationIndexOffset + 42,
                DeviceKey = new EcPublicJwk("EC", "P-256", "device",
                    Base64Url.EncodeToString(point.X!), Base64Url.EncodeToString(point.Y!)),
            },
            TestContext.Current.CancellationToken);

        var sdJwt = credential.ToSdJwt();
        var verifyAt = credential.IssuedAt.ToUnixTimeSeconds();

        var fixture = new Fixture(
            "1.1",
            "Verifiers must pin their clock to verifyAtUnix: the Key Binding JWT is only fresh for 30 seconds after it. Regenerate with FLASHID_UPDATE_FIXTURE=1.",
            credential.IssuedAt.ToString("O"),
            verifyAt,
            [signingProvider.ActiveKey.PublicJwk],
            sdJwt + KeyBindingJwt(sdJwt, deviceKey, verifyAt),
            new Expectation(EmergencyClaimNames.Vct, EmergencyClaimNames.RevocationIndexOffset + 42, claims));

        var path = FixturePath();
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(fixture, FixtureJsonOptions), TestContext.Current.CancellationToken);
    }
}
