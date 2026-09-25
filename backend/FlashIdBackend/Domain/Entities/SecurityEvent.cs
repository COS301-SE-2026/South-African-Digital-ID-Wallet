using Domain.Enums;

namespace Domain.Entities;

public class SecurityEvent : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public SecurityEventType EventType { get; set; }

    public DateTime OccurredAt { get; set; }

    public string IpAddress { get; set; } = string.Empty;

    public string? City { get; set; }
    public string? Country { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public string? DeviceTokenHash { get; set; }
    public string DeviceDescription { get; set; } = string.Empty;
    public bool IsTrustedDevice { get; set; }
    public bool IsNewDevice { get; set; }

    public int RiskScore { get; set; }
    public FraudRiskLevel RiskLevel { get; set; }
}
