using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using System.Text.Encodings.Web;
using Application.Features.Credentials.Exceptions;

namespace Application.Common.Services;

public sealed class SdJwtCredentialFactory : ISdJwtCredentialFactory
{
    // System.Text.Json escapes the plus sign, so this reaches the wire as dc\u002Bsd-jwt. That is valid
    // JSON and parses back to dc+sd-jwt, and the signature covers the exact bytes sent either way.
    private const string TokenType = "dc+sd-jwt";
    // SD-JWT VC requires iss to be a URI, and standard verifiers resolve issuer metadata from it.
    private const string Issuer = "urn:flashid:issuer";
    private const string DigestAlgorithm = "sha-256";
    private const int SaltBytes = 16;
    // P-256 coordinates are exactly 32 bytes
    private const int CoordinateBytes = 32;
    // D-007: 30 days max, which bounds how long a retired signing key must stay published.
    private static readonly TimeSpan MaxValidity = TimeSpan.FromDays(30);
    // Relaxed escaping keeps typ as dc+sd-jwt and leaves accented names intact, instead of emitting \u002B & \u00EB
    private static readonly JsonSerializerOptions WireJsonOptions = new()
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };
    private readonly ICredentialSigningProvider _signingProvider;
    private readonly TimeProvider _timeProvider;

    public SdJwtCredentialFactory(ICredentialSigningProvider signingProvider, TimeProvider timeProvider)
    {
        _signingProvider = signingProvider;
        _timeProvider = timeProvider;
    }

    public async Task<SdJwtCredential> CreateAsync(SdJwtCredentialRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        // Validated before the signing provider is called, so a bad request never costs a key lookup.
        var issuedAt = _timeProvider.GetUtcNow();
        var expiresAt = ValidateAndResolveExpiry(request, issuedAt);

        // The kid is signed inside the header, so the key has to be chosen before the header exists.
        var signingKey = await _signingProvider.GetActiveKeyAsync(cancellationToken);
        var disclosures = new Dictionary<string, string>(request.Claims.Count, StringComparer.Ordinal);
        var digests = new List<string>(request.Claims.Count);

        foreach (var (claimName, claimValue) in request.Claims)
        {
            var disclosure = CreateDisclosure(claimName, claimValue);
            disclosures[claimName] = disclosure;

            // wire-format section 4: the digest covers the base64url text, never the decoded JSON.
            digests.Add(Base64Url.EncodeToString(SHA256.HashData(Encoding.ASCII.GetBytes(disclosure))));
        }

        // Shuffled so the position of a digest in _sd reveals nothing about which claim it is.
        var shuffled = digests.ToArray();
        RandomNumberGenerator.Shuffle(shuffled.AsSpan());

        var signingInput = $"{Encode(BuildHeader(signingKey))}.{Encode(BuildPayload(request, shuffled, issuedAt, expiresAt))}";
        // Base64url text is ASCII, so these are exactly the bytes the verifier will hash.
        var signature = await _signingProvider.SignAsync(signingKey.KeyId, Encoding.ASCII.GetBytes(signingInput), cancellationToken);

        return new SdJwtCredential(
            $"{signingInput}.{Base64Url.EncodeToString(signature)}",
            disclosures,
            signingKey.KeyId,
            issuedAt,
            expiresAt
        );
    }

    private static DateTimeOffset ValidateAndResolveExpiry(SdJwtCredentialRequest request, DateTimeOffset issuedAt)
    {
        if (string.IsNullOrWhiteSpace(request.Vct))
        {
            throw new ArgumentException("A credential type (vct) is required.", nameof(request));
        }

        if (request.Claims.Count == 0)
        {
            throw new ArgumentException("A credential needs at least one claim.", nameof(request));
        }

        if (request.RevocationIndex < 0)
        {
            throw new ArgumentException("The revocation index cannot be negative.", nameof(request));
        }

        foreach (var (name, value) in request.Claims)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("A claim name can't be blank.", nameof(request));
            }

            // An empty disclosure proves nothing and still costs a QR frame, and a verifier rejects a mandatory claim that is present but blank.
            // Callers omit a claim instead of blanking it.
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException($"Claim '{name}' has no value.", nameof(request));
            }
        }

        // A presentation missing a mandatory claim is rejected by the verifier, so refuse to sign one rather than issue a credential that can never be used.
        var missing = request.MandatoryClaimNames.Where(name => !request.Claims.ContainsKey(name)).ToList();

        if (missing.Count > 0)
        {
            throw new ArgumentException($"Mandatory claims are missing: {string.Join(", ", missing)}.", nameof(request));
        }

        ValidateDeviceKey(request.DeviceKey);

        var cap = issuedAt.Add(MaxValidity);
        var expiresAt = request.DocumentExpiresAt is { } documentExpiry && documentExpiry < cap ? documentExpiry : cap;

        if (expiresAt <= issuedAt)
        {
            throw new ArgumentException("The credential has already expired and can't be presented offline.", nameof(request));
        }

        return expiresAt;
    }

    private static void ValidateDeviceKey(EcPublicJwk? deviceKey)
    {
        if (deviceKey is null) return;

        if (deviceKey.Kty != "EC" || deviceKey.Crv != "P-256")
        {
            throw new InvalidDeviceKeyException("it must be an EC P-256 key.");
        }

        byte[] x;
        byte[] y;

        try
        {
            x = Base64Url.DecodeFromChars(deviceKey.X);
            y = Base64Url.DecodeFromChars(deviceKey.Y);
        }
        catch (FormatException fe)
        {
            throw new InvalidDeviceKeyException("its coordinates are not valid base64url.", fe);
        }

        // Checked here rather than left to the import, because a wrong length is reported differently
        // on each platform: PlatformNotSupportedException on Windows, CryptographicException on Linux.
        if (x.Length != CoordinateBytes || y.Length != CoordinateBytes)
        {
            throw new InvalidDeviceKeyException($"its coordinates must be {CoordinateBytes} bytes each.");
        }

        try
        {
            // Importing checks both coordinates are 32 bytes and that the point is actually on P-256
            // A malformed cnf would produce a credential that can never be presented, fixable only by re-minting
            using var key = ECDsa.Create(new ECParameters
            {
                Curve = ECCurve.NamedCurves.nistP256,
                Q = new ECPoint
                {
                    X = x,
                    Y = y
                },
            });
        }
        catch (Exception e) when (e is CryptographicException or NotSupportedException or ArgumentException)
        {
            throw new InvalidDeviceKeyException("it is not a point on P-256.", e);
        }
    }

    private static string CreateDisclosure(string claimName, string claimValue)
    {
        // A fresh salt per claim, every time a package is minted, stops a verifier recognising a claim by its digest.
        var salt = Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(SaltBytes));
        var json = JsonSerializer.Serialize(new object[] { salt, claimName, claimValue }, WireJsonOptions);

        return Base64Url.EncodeToString(Encoding.UTF8.GetBytes(json));
    }

    private static JsonObject BuildHeader(CredentialSigningKey signingKey) => new()
    {
        ["alg"] = signingKey.Algorithm,
        ["typ"] = TokenType,
        ["kid"] = signingKey.KeyId,
    };

    private static JsonObject BuildPayload(SdJwtCredentialRequest request, string[] digests, DateTimeOffset issuedAt, DateTimeOffset expiresAt)
    {
        var sd = new JsonArray();

        foreach (var digest in digests)
        {
            sd.Add(JsonValue.Create(digest));
        }

        var payload = new JsonObject
        {
            ["iss"] = Issuer,
            ["vct"] = request.Vct,
            ["iat"] = issuedAt.ToUnixTimeSeconds(),
            ["exp"] = expiresAt.ToUnixTimeSeconds(),
            ["ri"] = request.RevocationIndex,
            ["_sd_alg"] = DigestAlgorithm,
            ["_sd"] = sd,
        };

        if (request.DeviceKey is { } deviceKey)
        {
            // Holder binding (D-005): only this device's private key can produce a valid Key Binding JWT
            payload["cnf"] = new JsonObject
            {
                ["jwk"] = new JsonObject
                {
                    ["kty"] = deviceKey.Kty,
                    ["crv"] = deviceKey.Crv,
                    ["x"] = deviceKey.X,
                    ["y"] = deviceKey.Y,
                },
            };
        }

        return payload;
    }

    private static DateTimeOffset ExpiryFor(DateTimeOffset? documentExpiresAt, DateTimeOffset issuedAt)
    {
        // D-007: the earlier of the document's own expiry and 30 days from now.
        var cap = issuedAt.Add(MaxValidity);
        var expiresAt = documentExpiresAt is { } documentExpiry && documentExpiry < cap ? documentExpiry : cap;

        // Signing an already expired document would produce a credential the verifier rejects at step 5.
        if (expiresAt <= issuedAt)
        {
            throw new InvalidOperationException("The credential has already expired and can't be presented offline.");
        }

        return expiresAt;
    }

    private static string Encode(JsonObject json) => Base64Url.EncodeToString(Encoding.UTF8.GetBytes(json.ToJsonString(WireJsonOptions)));
}
