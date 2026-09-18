using Application.Common.Interfaces.ProviderInterfaces;

namespace Application.Common.Interfaces.ServiceInterfaces;

// Parameter Object: one record instead of six arguments, so a new field later does not change every caller.
public sealed record SdJwtCredentialRequest
{

    public required string Vct { get; init; }

    // Claim name to value, already mapped through SdJwtClaimNames. All values are strings.
    public required IReadOnlyDictionary<string, string> Claims { get; init; }

    public required IReadOnlyCollection<string> MandatoryClaimNames { get; init; }

    // The only credential identifier that appears in a presentation (D-012).
    public required long RevocationIndex { get; init; }

    // Null when the credential has no expiry of its own; the 30-day cap still applies (D-007).
    public DateTimeOffset? DocumentExpiresAt { get; init; }

    // Holder binding (D-005), filled in from Phase 4 once the wallet sends its device key.
    public EcPublicJwk? DeviceKey { get; init; }
}

// The signed result: the issuer JWT plus every disclosure, keyed by claim name so the wallet can
// choose which ones to present.
public sealed record SdJwtCredential(
    string IssuerJwt,
    IReadOnlyDictionary<string, string> Disclosures,
    string KeyId,
    DateTimeOffset IssuedAt,
    DateTimeOffset ExpiresAt)
{

    // wire-format section 7: issuer JWT, then each disclosure, always ending with a tilde.
    public string ToSdJwt() => Disclosures.Count == 0
        ? IssuerJwt + "~"
        : IssuerJwt + "~" + string.Join("~", Disclosures.Values) + "~";
}
