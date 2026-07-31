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