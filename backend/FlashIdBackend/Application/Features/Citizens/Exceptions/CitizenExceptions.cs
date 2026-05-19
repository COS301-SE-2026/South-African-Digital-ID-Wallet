namespace Application.Features.Citizens.Exceptions;

public class CitizenAlreadyRegisteredException : Exception
{
    public CitizenAlreadyRegisteredException(string saId)
        : base($"A citizen with SA ID '{saId}' is already registered.") { }
}

public class UsernameTakenException : Exception
{
    public UsernameTakenException(string username)
        : base($"The username '{username}' is already taken.") { }
}

public class InvalidCitizenRegistrationRequestException : Exception
{
    public InvalidCitizenRegistrationRequestException(string message)
        : base(message) { }
}
