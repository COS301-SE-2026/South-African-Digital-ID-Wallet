using System.Text.Json.Serialization;

namespace Application.Common.Interfaces.ProviderInterfaces;

// P-256 public key in JSON Web Key form. JWK member names are lowercase and case-sensitive, so they are pinned here.
public sealed record EcPublicJwk(
    [property: JsonPropertyName("kty")] string Kty,
    [property: JsonPropertyName("crv")] string Crv,
    [property: JsonPropertyName("kid")] string Kid,
    [property: JsonPropertyName("x")] string X,
    [property: JsonPropertyName("y")] string Y);