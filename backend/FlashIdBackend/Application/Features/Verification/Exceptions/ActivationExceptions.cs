namespace Application.Features.Verification.Exceptions;

public class ActivationDetailsInvalidException : Exception
{
    // deliberately does not say which of token, SA ID or PIN was wrong
    public ActivationDetailsInvalidException()
        : base("The activation details don't match. Check your SA ID number and the 6-digit PIN from your Home Affairs official, and make sure you opened the latest activation link from your email. Too many wrong attempts will lock activation for a few minutes.") { }
}

public class ActivationUnavailableException : Exception
{
    // the code exists but can't be used right now: used, revoked, expired, locked or a link conflict
    public ActivationUnavailableException(string message)
        : base(message) { }
}
