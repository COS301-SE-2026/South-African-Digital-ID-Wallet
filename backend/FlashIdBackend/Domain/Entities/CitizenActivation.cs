namespace Domain.Entities;

public class CitizenActivation
{
    public Guid Id { get; set; }

    public Guid CitizenId { get; set; }
    public Citizen Citizen { get; set; } = null!;

    public string TokenHash { get; set; } = null!;
    public string PinHash { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public int AttemptCount { get; set; }
    public DateTime? LockedUntil { get; set; }


    public DateTime? UsedAt { get; set; }

    public DateTime CreatedAt { get; set; }

}