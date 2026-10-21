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
        AuditEventType.EmergencyProfileAccessFailed,
        AuditEventType.QrGenerationBlocked,
        AuditEventType.OfflineVerificationRejected,
    };

    public static readonly HashSet<AuditEventType> ViewEvents = new()
    {
        AuditEventType.AuditLogViewed,
        AuditEventType.CitizenStatusViewed,
    };

    // An official's citizen-facing work: drives "My recent work" and the "Citizen work" tab
    public static readonly HashSet<AuditEventType> OfficialWorkEvents = new()
    {
        AuditEventType.OnboardCitizen,
        AuditEventType.OnboardCitizenFailed,
        AuditEventType.ConsentRecorded,
        AuditEventType.CredentialIssued,
        AuditEventType.CredentialVerified,
        AuditEventType.CitizenVerificationFailed,
        AuditEventType.OfflineCredentialVerified,
        AuditEventType.OfflineVerificationRejected,
        AuditEventType.EmergencyProfileAccessed,
        AuditEventType.EmergencyProfileAccessFailed,
    };

    // The citizen chose what to reveal, so official-facing views must never show who they are
    public static readonly HashSet<AuditEventType> SelectiveDisclosureEvents = new()
    {
        AuditEventType.CredentialVerified,
        AuditEventType.OfflineCredentialVerified,
    };

    public static string ToOutcome(this AuditEventType eventType) =>
        ViewEvents.Contains(eventType) ? "Access"
        : FailedEvents.Contains(eventType) ? "Failed"
        : "Success";
}
