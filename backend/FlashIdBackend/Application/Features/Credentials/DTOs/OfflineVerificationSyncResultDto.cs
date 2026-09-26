namespace Application.Features.Credentials.DTOs;

// Duplicates were already recorded by an earlier upload. Rejected lists entries that can never be recorded (a missing id,
// a malformed result, an impossible time or index), so the phone drops those without losing the rest of the batch.
public sealed record OfflineVerificationSyncResultDto(int Recorded, int Duplicates, IReadOnlyList<Guid> Rejected);
