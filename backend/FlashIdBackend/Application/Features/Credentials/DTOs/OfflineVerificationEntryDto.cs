namespace Application.Features.Credentials.DTOs;

public sealed record OfflineVerificationEntryDto(Guid Id, int? RevocationIndex, string Result, long VerifiedAt);
