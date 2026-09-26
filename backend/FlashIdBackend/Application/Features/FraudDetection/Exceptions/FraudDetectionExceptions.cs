using Domain.Enums;

namespace Application.Features.FraudDetection.Exceptions;

public class FraudAlertNotFoundException : Exception
{
    public FraudAlertNotFoundException(Guid alertId)
        : base($"Security alert {alertId} was not found.") { }
}

public class FraudAlertAlreadyResolvedException : Exception
{
    public FraudAlertAlreadyResolvedException(FraudAlertStatus status)
        : base($"This security alert has already been {status.ToString().ToLowerInvariant()}.") { }
}

public class StepUpVerificationFailedException : Exception
{
    public const string ErrorCode = "STEP_UP_FAILED";

    public StepUpVerificationFailedException()
        : base("Additional verification failed. Please confirm your password.") { }
}

public class QrGenerationRestrictedException : Exception
{
    public const string RiskRestriction = "QR_GENERATION_RESTRICTED";
    public const string TrustedDeviceRequired = "TRUSTED_DEVICE_REQUIRED";

    public QrGenerationRestrictedException(string code, DateTime? restrictedUntil, Guid? alertId)
        : base(code == TrustedDeviceRequired
            ? "QR codes can only be generated from a trusted device while extra verification is enabled."
            : "QR code generation is temporarily restricted because suspicious activity was detected on your account. Please review your security alerts.")
    {
        Code = code;
        RestrictedUntil = restrictedUntil;
        AlertId = alertId;
    }

    public string Code { get; }
    public DateTime? RestrictedUntil { get; }
    public Guid? AlertId { get; }
}
