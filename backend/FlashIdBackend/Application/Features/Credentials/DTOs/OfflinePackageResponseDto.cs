namespace Application.Features.Credentials.DTOs;

// The stored package
public sealed record OfflinePackageResponseDto(
    string IssuerSignedCredential,
    Dictionary<string, string> Disclosure,
    DateTime SignedAt,
    DateTime ExpiresAt
);
