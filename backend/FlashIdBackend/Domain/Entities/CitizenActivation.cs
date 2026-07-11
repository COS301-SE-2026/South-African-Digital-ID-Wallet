using Domain.Enums;

namespace Domain.Entities;

public class CitizenActivation : BaseEntity
{
    public Guid CitizenId { get; set; }
    public Citizen Citizen { get; set; } = null!;

    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;
    public string PinHash { get; set; } = string.Empty;

    public ActivationStatus Status { get; set; }
        = ActivationStatus.Pending;

    public DateTime ExpiresAt { get; set; }

    public int AttemptCount { get; set; }
    public DateTime? LockedUntil { get; set; }

    public DateTime? UsedAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public string? RevokedReason { get; set; }


}