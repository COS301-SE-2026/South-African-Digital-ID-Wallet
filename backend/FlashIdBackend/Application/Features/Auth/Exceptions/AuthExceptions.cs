namespace Application.Features.Auth.Exceptions;

public class EmailNotVerifiedException : Exception
{
    public EmailNotVerifiedException(string email)
        : base($"Please verify your email address.") { }
}