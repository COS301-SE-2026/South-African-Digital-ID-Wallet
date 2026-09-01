namespace Application.Features.Credentials.Exceptions;

public class CredentialUpdateJobAlreadyRunningException : Exception
{
    public CredentialUpdateJobAlreadyRunningException() : base("A credential update check is already running for today.") { }
}