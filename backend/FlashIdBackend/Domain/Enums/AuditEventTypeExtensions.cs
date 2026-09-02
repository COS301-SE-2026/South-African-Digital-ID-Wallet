using Domain.Enums;

namespace Domain.Enums;

public static class AuditEventTypeExtensions
{
    public static readonly HashSet<AuditEventType> FailedEvents = new()
    {
        AuditEventType.OnboardCitizenFailed,
        AuditEventType.CitizenVerificationFailed,
        AuditEventType.CitizenCredentialsActivationFailed,
        AuditEventType.DeviceVerificationFailed,
    };

    public static readonly HashSet<AuditEventType> ViewEvents = new()
    {
        AuditEventType.AuditLogViewed,
        AuditEventType.CitizenStatusViewed,
    };

    public static string ToOutcome(this AuditEventType eventType) =>
        FailedEvents.Contains(eventType) ? "Failed" : "Success";
}
