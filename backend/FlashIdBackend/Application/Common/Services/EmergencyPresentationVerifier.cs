using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;

namespace Application.Common.Services;

public sealed record VerifiedEmergencyPresentation(int RevocationIndex, DateTimeOffset KeyBoundAt);

public static class EmergencyPresentationVerifier
{
    public const int MaxLength = 16_384;

    private const string Algorithm = "ES256";
    private const string CredentialType = "dc+sd-jwt";
    private const string KeyBindingType = "kb+jwt";
    private const string Issuer = "urn:flashid:issuer";

    public static VerifiedEmergencyPresentation? Verify(string? presentation, CredentialSigningKey issuerKey)
    {
        if (string.IsNullOrEmpty(presentation) || presentation.Length > MaxLength)
        {
            return null;
        }

        var firstTilde = presentation.IndexOf('~');
        var lastTilde = presentation.LastIndexOf('~');
        if (firstTilde <= 0 || lastTilde == presentation.Length - 1)
        {
            return null;
        }

        var sdJwt = presentation[..(lastTilde + 1)];
        var keyBindingJwt = presentation[(lastTilde + 1)..];

        try
        {
            using var issuer = ImportP256(issuerKey.PublicJwk.X, issuerKey.PublicJwk.Y);
            if (ReadVerified(presentation[..firstTilde], issuer) is not { } issuerJwt)
            {
                return null;
            }

            var (issuerHeader, payload) = issuerJwt;
            if (Text(issuerHeader, "alg") != Algorithm
                || Text(issuerHeader, "typ") != CredentialType
                || Text(issuerHeader, "kid") != issuerKey.KeyId
                || Text(payload, "iss") != Issuer
                || Text(payload, "vct") != EmergencyClaimNames.Vct
                || !payload.TryGetProperty("ri", out var ri) || !ri.TryGetInt32(out var revocationIndex))
            {
                return null;
            }

            var jwk = payload.GetProperty("cnf").GetProperty("jwk");
            if (Text(jwk, "kty") != "EC" || Text(jwk, "crv") != "P-256")
            {
                return null;
            }

            using var device = ImportP256(Text(jwk, "x")!, Text(jwk, "y")!);
            if (ReadVerified(keyBindingJwt, device) is not { } bindingJwt)
            {
                return null;
            }

            var (bindingHeader, binding) = bindingJwt;
            if (Text(bindingHeader, "alg") != Algorithm
                || Text(bindingHeader, "typ") != KeyBindingType
                || !binding.TryGetProperty("iat", out var iat) || !iat.TryGetInt64(out var boundAt))
            {
                return null;
            }

            var expectedHash = Base64Url.EncodeToString(SHA256.HashData(Encoding.ASCII.GetBytes(sdJwt)));
            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.ASCII.GetBytes(Text(binding, "sd_hash") ?? string.Empty),
                    Encoding.ASCII.GetBytes(expectedHash)))
            {
                return null;
            }

            return new VerifiedEmergencyPresentation(revocationIndex, DateTimeOffset.FromUnixTimeSeconds(boundAt));
        }
        catch (Exception ex) when (ex is FormatException or JsonException or CryptographicException
                                       or KeyNotFoundException or InvalidOperationException or ArgumentException)
        {
            return null;
        }
    }

    private static (JsonElement Header, JsonElement Payload)? ReadVerified(string jwt, ECDsa key)
    {
        var parts = jwt.Split('.');
        if (parts.Length != 3)
        {
            return null;
        }

        var signingInput = Encoding.ASCII.GetBytes($"{parts[0]}.{parts[1]}");
        if (!key.VerifyData(signingInput, Base64Url.DecodeFromChars(parts[2]), HashAlgorithmName.SHA256))
        {
            return null;
        }

        return (Parse(parts[0]), Parse(parts[1]));
    }

    private static JsonElement Parse(string part)
    {
        using var document = JsonDocument.Parse(Base64Url.DecodeFromChars(part));
        return document.RootElement.Clone();
    }

    private static string? Text(JsonElement element, string name) =>
        element.ValueKind == JsonValueKind.Object
        && element.TryGetProperty(name, out var value)
        && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    private static ECDsa ImportP256(string x, string y) =>
        ECDsa.Create(new ECParameters
        {
            Curve = ECCurve.NamedCurves.nistP256,
            Q = new ECPoint { X = Base64Url.DecodeFromChars(x), Y = Base64Url.DecodeFromChars(y) },
        });
}
