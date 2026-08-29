using Domain.Enums;

namespace Domain.Entities;

public class PhysicalIdentityVerification : BaseEntity
{
    public Guid UserId { get; set; }
    public IdentityVerificationStatus Status { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? ConsentGrantedAt { get; set; }
    public string? SubmittedIdNumberHash { get; set; }
    public string? OcrIdNumberHash { get; set; }
    public string? AzureLivenessSessionId { get; set; }
    public bool? CardFaceMatchedLiveFace { get; set; }
    public bool? LivenessPassed { get; set; }
    public bool? RegistryIdentityMatched { get; set; }
    public bool? RegistryFaceMatched { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? FailureReason { get; set; }
    public int AttemptCount { get; set; }
}