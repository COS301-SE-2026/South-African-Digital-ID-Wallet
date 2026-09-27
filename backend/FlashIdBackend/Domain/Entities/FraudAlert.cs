using Domain.Enums;

namespace Domain.Entities;

public class FraudAlert : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid SecurityEventId { get; set; }
    public SecurityEvent SecurityEvent { get; set; } = null!;

    public Guid? PreviousSecurityEventId { get; set; }
    public SecurityEvent? PreviousSecurityEvent { get; set; }

    public int RiskScore { get; set; }
    public FraudRiskLevel RiskLevel { get; set; }
    public FraudAlertStatus Status { get; set; } = FraudAlertStatus.Open;

    public string Signals { get; set; } = string.Empty;

    public bool IsImpossibleTravel { get; set; }
    public double? DistanceKm { get; set; }
    public double? ElapsedMinutes { get; set; }
    public double? ImpliedSpeedKmh { get; set; }

    public DateTime? ResolvedAt { get; set; }
    public SecureAccountAction? ResolutionAction { get; set; }
}
