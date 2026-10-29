namespace Application.Features.Credentials.Exceptions;

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

public class InvalidDisclosedFieldsException : Exception
{
    public InvalidDisclosedFieldsException(IEnumerable<string> fields)
        : base($"Invalid or missing disclosed fields: {string.Join(", ", fields)}") { }
}

public class InvalidDisclosureTokenException : Exception
{
    public InvalidDisclosureTokenException()
        : base("This QR Code is expired, invalid, or has already been used.") { }
}

public class InvalidCredentialStatusTransitionException : Exception
{
    public InvalidCredentialStatusTransitionException(string message)
        : base(message) { }
}

public class CitizenNotFoundException : Exception
{
    public CitizenNotFoundException(Guid citizenId)
        : base($"No citizen with ID '{citizenId}' was found.") { }
}

public class CitizenNotLinkedException : Exception
{
    // account exists but no Citizen row has this UserId yet
    public CitizenNotLinkedException()
        : base("Your FlashID account is not linked to a verified identity yet. Go to Verify Identity and choose Activation Code (the code from your Home Affairs official) or Face Verification (your SA ID number and a quick face scan). Then come back here to activate your credentials.") { }
}

public class CitizenIdentityNotVerifiedException : Exception
{
    // Citizen row is linked but still Pending or otherwise not Verified/Activated
    public CitizenIdentityNotVerifiedException()
        : base("Your identity verification is not complete yet. Go to Verify Identity to finish it, then come back here to activate your credentials.") { }
}
