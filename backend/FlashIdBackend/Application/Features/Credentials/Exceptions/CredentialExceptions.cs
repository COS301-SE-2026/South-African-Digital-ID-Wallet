namespace Application.Features.Credentials.Exceptions;

public class MissingMandatoryFieldsException : Exception
{
    public MissingMandatoryFieldsException(IEnumerable<string> missingKeys) : base($"The following mandatory fields must be included: {string.Join(", ", missingKeys)}.") { }
}

public class CredentialNotFoundException : Exception
{
    public CredentialNotFoundException(Guid credentialId)
        : base($"No credential with ID '{credentialId}' was found.") { }
}

public class CredentialNotActiveException : Exception
{
    public CredentialNotActiveException()
        : base("QR codes cannot be generated for credentials that are not active.") { }
}

public class CredentialAccessDeniedException : Exception
{
    public CredentialAccessDeniedException()
        : base("You do not have permission to access this credential.") { }
}