namespace Domain.Entities;

public class UserSecurityProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public bool ImpossibleTravelDetectionEnabled { get; set; } = true;

    public bool EnhancedVerificationEnabled { get; set; }

    public DateTime? QrRestrictedUntil { get; set; }

    public DateTime UpdatedAt { get; set; }
}
