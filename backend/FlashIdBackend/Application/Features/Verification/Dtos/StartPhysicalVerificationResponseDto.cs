using Domain.Enums;

namespace Application.Features.Verification.Dtos;

public class StartPhysicalVerificationResponseDto
{
    public Guid VerificationId { get; set; }
    public IdentityVerificationStatus Status { get; set; }
    public DateTime ExpiresAt { get; set; }
}