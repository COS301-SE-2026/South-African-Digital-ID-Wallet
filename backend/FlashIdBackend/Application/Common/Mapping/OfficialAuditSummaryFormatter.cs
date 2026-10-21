using System.Text.RegularExpressions;
using Domain.Enums;

namespace Application.Common.Mapping;

// Turns an audit row into the one line officials see, so the Activity card and the audit table always agree
public static partial class OfficialAuditSummaryFormatter
{
    // QrService writes "(3 field(s))" into Details; this reads the number back out
    [GeneratedRegex(@"\((\d+) field\(s\)\)")]
    private static partial Regex FieldCountPattern();

    public static string Format(AuditEventType eventType, string details, string? credentialType)
    {
        var credential = credentialType ?? "Credential";

        return eventType switch
        {
            AuditEventType.CredentialVerified => FieldCountPattern().Match(details) is { Success: true } match
                ? $"{credential} · {match.Groups[1].Value} {(match.Groups[1].Value == "1" ? "field" : "fields")} disclosed"
                : $"{credential} verified",
            AuditEventType.OfflineCredentialVerified => $"{credential} · offline scan",
            AuditEventType.OfflineVerificationRejected => "Offline scan rejected",
            AuditEventType.CitizenVerificationFailed => "QR verification failed",
            // Account events: the raw Details repeat the action and the official's email, so use short labels instead
            AuditEventType.UserLoggedIn => "Signed in",
            AuditEventType.UserLoggedOut => "Signed out",
            AuditEventType.FailedLoginAttempt => "Wrong email or password",
            AuditEventType.DeviceVerificationRequested => "Code emailed to confirm a new device",
            AuditEventType.DeviceVerificationResent => "Device code resent",
            AuditEventType.DeviceVerified => "New device trusted",
            AuditEventType.DeviceVerificationFailed => "Wrong device code entered",
            AuditEventType.PasswordReset => "Password reset",
            AuditEventType.ConsentRecorded => "POPIA consent recorded",
            _ => details,
        };
    }
}
