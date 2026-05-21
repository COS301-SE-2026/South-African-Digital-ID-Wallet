namespace Application.Features.Onboarding.Exceptions;

public class IdentityRecordNotFoundException : Exception
{
    public IdentityRecordNotFoundException()
        : base("No identity record was found for the supplied ID number.")
    {
    }
}
