namespace Application.Features.Verification.Exceptions;

public class VerificationExpiredException : Exception
{
    public VerificationExpiredException() : base("The verification session has expired.")
    {
    }
}

public class VerificationNotFoundException : Exception
{
    public VerificationNotFoundException()
        : base("Verification session could not be found.")
    {
    }
}