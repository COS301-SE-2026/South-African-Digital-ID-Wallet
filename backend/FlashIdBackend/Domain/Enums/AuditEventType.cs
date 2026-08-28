namespace Domain.Enums;

public enum AuditEventType
{
    UserRegistered,
    UserLoggedIn,
    UserLoggedOut,
    FailedLoginAttempt,
    CredentialIssued,
    CredentialRevoked,
    CredentialReinstated,
    CredentialVerified,
    CredentialExpired,
    InstitutionRegistered,
    OfficialVerified,
    AccountDeleted,
    ConsentRecorded,
    OnboardCitizen,
    OnboardCitizenFailed,
    EmailAddressChanged,
    CitizenVerified,
    CitizenVerificationFailed,
    CitizenCredentialsActivated,
    CitizenCredentialsDeactivated,
    CitizenCredentialsActivationFailed,
    DeviceVerificationRequested,
    DeviceVerificationFailed,
    DeviceVerified,
}