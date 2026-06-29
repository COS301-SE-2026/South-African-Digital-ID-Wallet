namespace Application.Features.Citizens.Exceptions;

public class CitizenNotFoundException : Exception
{
    public CitizenNotFoundException(string saId)
        : base($"No citizen with SA ID '{saId}' was found. Please contact your Home Affairs official or activate your digital ID using the physical ID approach.") { }
}

public class CitizenAlreadyActivatedException : Exception
{
    public CitizenAlreadyActivatedException(string saId)
        : base($"The citizen with SA ID '{saId}' has already completed registration.") { }
}

public class InvalidActivationCodeException : Exception
{
    public InvalidActivationCodeException()
        : base("The activation code is incorrect. Please check the code sent to you by your official.") { }
}

public class ActivationCodeExpiredException : Exception
{
    public ActivationCodeExpiredException()
        : base("The activation code has expired. Please contact your Home Affairs official for a new code.") { }
}

public class EmailTakenException : Exception
{
    public EmailTakenException(string email)
        : base($"The email '{email}' is already taken.") { }
}

public class InvalidCitizenRegistrationRequestException : Exception
{
    public InvalidCitizenRegistrationRequestException(string message)
        : base(message) { }
}

public class InvalidOTPException : Exception
{
    public InvalidOTPException()
        : base("The verification code is incorrect") { }
}

public class OTPExpiredException : Exception
{
    public OTPExpiredException()
        : base("The verification code has expired. Please request a new code.") { }
}

public class TooManyOTPAttemptsException : Exception
{
    public TooManyOTPAttemptsException()
        : base("Too many incorrect attempts. Please request a new code.") { }
}

public class EmailAlreadyVerified : Exception
{
    public EmailAlreadyVerified()
        : base("Email is already verified.") { }
}