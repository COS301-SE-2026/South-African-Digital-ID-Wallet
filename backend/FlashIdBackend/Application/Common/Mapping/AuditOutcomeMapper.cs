using Domain.Enums;

namespace Application.Common.Mapping;

public static class AuditOutcomeMapper
{
    public static readonly HashSet<AuditEventType> FailedEvents = new()
    {
        AuditEventType.OnboardCitizenFailed,
        AuditEventType.CitizenVerificationFailed,
        AuditEventType.CitizenCredentialsActivationFailed,
        AuditEventType.DeviceVerificationFailed,
    };

    public static bool ToOutcome(AuditEventType eventType, string? outcome) =>
        string.IsNullOrWhiteSpace(outcome) ||
        (string.Equals(outcome, "Failed", StringComparison.OrdinalIgnoreCase) == FailedEvents.Contains(eventType));
}