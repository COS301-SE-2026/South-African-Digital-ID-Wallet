using Domain.Enums;

namespace Application.Features.Verification.Dtos;

public class PhysicalVerificationResponseDto
{
    public Guid VerificationId { get; set; }
    public IdentityVerificationStatus Status { get; set; }
    public bool? RegistryIdentityMatched { get; set; }
    public bool? LivenessPassed { get; set; }
    public bool? RegistryFaceMatched { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? FailureReason { get; set; }
}