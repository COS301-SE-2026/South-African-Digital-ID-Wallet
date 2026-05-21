namespace Application.Features.GovernmentAdministrators.Exceptions;

// Government ID already exists in the GovernmentAdministrators table
public class GovAdminAlreadyExistsException : Exception
{
    public GovAdminAlreadyExistsException(string governmentId)
        : base($"A government administrator with ID '{governmentId}' already exists.") { }
}

// Username is already taken by another user
public class GovAdminUsernameTakenException : Exception
{
    public GovAdminUsernameTakenException(string username)
        : base($"The username '{username}' is already taken.") { }
}

// Email is already registered to another user
public class GovAdminEmailTakenException : Exception
{
    public GovAdminEmailTakenException(string email)
        : base($"The email address '{email}' is already registered.") { }
}

// Catch-all for malformed request data � thrown by the validator
public class InvalidGovAdminRequestException : Exception
{
    public InvalidGovAdminRequestException(string message)
        : base(message) { }
}
