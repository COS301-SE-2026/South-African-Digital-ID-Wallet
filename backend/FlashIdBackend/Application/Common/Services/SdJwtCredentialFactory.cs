using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;

namespace Application.Common.Services;

public sealed class SdJwtCredentialFactory : ISdJwtCredentialFactory
{
    // System.Text.Json escapes the plus sign, so this reaches the wire as dc\u002Bsd-jwt. That is valid
    // JSON and parses back to dc+sd-jwt, and the signature covers the exact bytes sent either way.
    private const string TokenType = "dc+sd-jwt";
    private const string Issuer = "flashid";
    private const string DigestAlgorithm = "sha-256";
    private const int SaltBytes = 16;
    // D-007: 30 days max, which bounds how long a retired signing key must stay published.
    private static readonly TimeSpan MaxValidity = TimeSpan.FromDays(30);
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

        Validate(request);

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

        var issuedAt = _timeProvider.GetUtcNow();
        var expiresAt = ExpiryFor(request.DocumentExpiresAt, issuedAt);
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

    private static void Validate(SdJwtCredentialRequest request)
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

            // Guards against a caller that ignores warnings. A null value would crash during serilaisation.
            if (value is null)
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
    }

    private static string CreateDisclosure(string claimName, string claimValue)
    {
        // A fresh salt per claim, every time a package is minted, stops a verifier recognising a claim by its digest.
        var salt = Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(SaltBytes));
        var json = JsonSerializer.Serialize(new object[] { salt, claimName, claimValue });

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

    private static string Encode(JsonObject json) => Base64Url.EncodeToString(Encoding.UTF8.GetBytes(json.ToJsonString()));
}
