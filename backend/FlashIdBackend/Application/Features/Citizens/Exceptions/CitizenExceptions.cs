namespace Application.Features.Citizens.Exceptions;

// SA ID not found in the Citizens table — citizen was never pre-onboarded by an official
public class CitizenNotFoundException : Exception
{
    public CitizenNotFoundException(string saId)
        : base($"No citizen with SA ID '{saId}' was found. Please contact your Home Affairs official.") { }
}

// Citizen exists but IsActivated is already true — they have already completed registration
public class CitizenAlreadyActivatedException : Exception
{
    public CitizenAlreadyActivatedException(string saId)
        : base($"The citizen with SA ID '{saId}' has already completed registration.") { }
}

// Activation code in the request does not match what is stored in the DB
public class InvalidActivationCodeException : Exception
{
    public InvalidActivationCodeException()
        : base("The activation code is incorrect. Please check the code sent to you by your official.") { }
}

// Activation code exists and matches but ActivationCodeExpiresAt has passed
public class ActivationCodeExpiredException : Exception
{
    public ActivationCodeExpiredException()
        : base("The activation code has expired. Please contact your Home Affairs official for a new code.") { }
}

// Username is already taken by another user in the system
public class UsernameTakenException : Exception
{
    public UsernameTakenException(string username)
        : base($"The username '{username}' is already taken.") { }
}

// Catch-all for malformed request data — thrown by the validator
public class InvalidCitizenRegistrationRequestException : Exception
{
    public InvalidCitizenRegistrationRequestException(string message)
        : base(message) { }
}
