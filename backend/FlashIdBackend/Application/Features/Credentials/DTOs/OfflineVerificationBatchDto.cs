namespace Application.Features.Credentials.DTOs;

public sealed record OfflineVerificationBatchDto(IReadOnlyList<OfflineVerificationEntryDto> Entries);
