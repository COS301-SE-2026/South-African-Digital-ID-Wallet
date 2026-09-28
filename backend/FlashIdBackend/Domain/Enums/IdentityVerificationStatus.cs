namespace Domain.Enums;

public enum IdentityVerificationStatus
{
    AwaitingConsent,
    AwaitingDocument,
    DocumentProcessing,
    AwaitingIdConfirmation,
    AwaitingLiveness,
    LivenessProcessing,
    AwaitingRegistryVerification,
    Verified,
    Failed,
    Expired
}