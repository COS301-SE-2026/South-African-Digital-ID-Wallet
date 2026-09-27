namespace Application.Features.Credentials.DTOs;

// The stored package
public sealed record OfflinePackageResponseDto(
    string IssuerSignedCredential,
    Dictionary<string, string> Disclosures,
    DateTimeOffset SignedAt,
    DateTimeOffset ExpiresAt
);
