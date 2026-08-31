using Domain.Enums;

namespace Domain.Entities;

public class FaceEnrollment : BaseEntity
{
    public Guid CitizenId { get; set; }
    public Citizen Citizen { get; set; } = null!;
    public FaceEnrollmentStatus Status { get; set; } = FaceEnrollmentStatus.Pending;
    public string? PendingSessionId { get; set; }
    public DateTime? SessionStartedAt { get; set; }
    public double? MatchConfidence { get; set; }
    public DateTime? EnrolledAt { get; set; }
    public DateTime? LastVerifiedAt { get; set; }
    public int FailedAttemptCount { get; set; }
    public DateTime? LockedUntil { get; set; }
}