namespace Application.Features.Onboarding.Exceptions;

public class IdentityRecordNotFoundException : Exception
{
    public IdentityRecordNotFoundException()
        : base("No identity record was found for the supplied ID number.")
    {
    }
}

public class CitizenConsentRequiredException : Exception
{
    public CitizenConsentRequiredException()
        : base("Citizen consent is required before onboarding.")
    {
    }
}

public class DuplicateIdRegisteredException : Exception
{
    public DuplicateIdRegisteredException()
        : base("Citizen ID number has already been registered.")
    {
    }
}