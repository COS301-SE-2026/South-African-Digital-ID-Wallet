namespace Application.Features.Auth.Exceptions;

public class EmailNotVerifiedException : Exception
{
    public EmailNotVerifiedException(string email)
        : base($"Please verify your email address.") { }
}

public class RefreshTokenAlreadyRotatedException : Exception
{
    public const string ErrorCode = "REFRESH_ALREADY_ROTATED";

    public RefreshTokenAlreadyRotatedException()
        : base("This session was just refreshed. Retry the request.") { }
}
