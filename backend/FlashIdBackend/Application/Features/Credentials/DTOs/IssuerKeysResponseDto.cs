namespace Application.Features.Credentials.DTOs;

// One published issuer key. Status is "active" for the key signing now, "retired" for a key whose
// private half is disabled but whose signatures must still verify (D-008).
public sealed record IssuerKeyDto(string Kid, string Kty, string Crv, string X, string Y, string Status);

// RetrievedAt lets a verifier age its cached trust data: a warning over 24 hours, refusal over 7 days (D-009).
public sealed record IssuerKeysResponseDto(IReadOnlyList<IssuerKeyDto> Keys, DateTimeOffset RetrievedAt);