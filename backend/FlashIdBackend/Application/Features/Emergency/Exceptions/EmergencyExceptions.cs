namespace Application.Features.Emergency.Exceptions;

public class InvalidEmergencyCodeException(string reason)
    : Exception("This emergency code is not valid.")
{
    public string Reason { get; } = reason;
}

public class EmergencyProfileNotFoundException()
    : Exception("No emergency profile is available for this device.");

public class EmergencyDeviceNotRegisteredException()
    : Exception("No emergency device is registered for this account.");

public class EmergencyConsentRequiredException()
    : Exception("Explicit consent is required before an emergency profile can be stored.");