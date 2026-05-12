namespace Domain.Enums;

public enum AuditEventType
{
    UserRegistered,
    UserLoggedIn,
    FailedLoginAttempt,
    CredentialIssued,
    CredentialRevoked,
    CredentialVerified,
    CredentialExpired,
    InstitutionRegistered,
    OfficialVerified,
    AccountDeleted,
}