namespace Application.Features.ManageUserAccountCard.Exceptions;

public class IncorrectPasswordException : Exception
{
    public IncorrectPasswordException() : base("Incorrect password.") { }
}

public class AccountLockedException : Exception
{
    public AccountLockedException(DateTime lockoutUntil) : base($"Too many failed attempt. Try again after {lockoutUntil:yyyy-MM-dd HH:mm} UTC.") { }
}

public class ReauthRequiredException : Exception
{
    public ReauthRequiredException() : base("Please re-enter your password to continue.") { }
}

public class NewEmailTakenException : Exception
{
    public NewEmailTakenException(string email) : base($"{email} is already in use.") { }
}

public class NoPendingEmailChangeException : Exception
{
    public NoPendingEmailChangeException() : base("No email change is currently pending. Please start again.") { }
}

public class InvalidEmailChangeOtpException : Exception
{
    public InvalidEmailChangeOtpException() : base("Verification code is incorrect.") { }
}

public class EmailChangeOtpExpiredException : Exception
{
    public EmailChangeOtpExpiredException() : base("Verification code has expired. Please request another code.") { }
}

public class TooManyEmailChangeOtpAttemptsException : Exception
{
    public TooManyEmailChangeOtpAttemptsException() : base("Too many attempts. Please request a new code.") { }
}

public class InvalidEmailException : Exception
{
    public InvalidEmailException() : base("Please enter a valid email address.") { }
}