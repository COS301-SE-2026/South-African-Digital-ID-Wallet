namespace Domain.Enums;

public enum AuditEventType
{
    UserRegistered,
    UserLoggedIn,
    UserLoggedOut,
    FailedLoginAttempt,
    CredentialIssued,
    CredentialRevoked,
    CredentialVerified,
    CredentialExpired,
    InstitutionRegistered,
    InstitutionApiKeyRegenerated,
    OfficialVerified,
    AccountDeleted,
    ConsentRecorded,
    OnboardCitizen,
    OnboardCitizenFailed,
}