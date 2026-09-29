namespace Application.Features.Credentials.Exceptions;

public class CredentialExpiryJobAlreadyRunningException : Exception
{
    public CredentialExpiryJobAlreadyRunningException()
        : base("A credential expiry check is already running for today.") { }
}
