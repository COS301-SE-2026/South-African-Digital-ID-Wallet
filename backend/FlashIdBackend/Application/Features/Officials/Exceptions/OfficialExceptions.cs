namespace Application.Features.Officials.Exceptions;

public class OfficialNotFoundException : Exception
{
    public OfficialNotFoundException()
        : base("No official record was found for this user.") { }
}

public class InvalidBadgeTokenException : Exception
{
    public InvalidBadgeTokenException()
        : base("This badge token is invalid, expired, or could not be verified.") { }
}