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
        : base("Explicit citizen consent is required before onboarding.")
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

public class InvalidSAPhoneNumberException : Exception
{
    public InvalidSAPhoneNumberException()
        : base("Invalid South African phone number format.")
    {
    }
}

public class DuplicateEmailRegisteredException : Exception
{
    public DuplicateEmailRegisteredException()
        : base("User email has already been registered.")
    {
    }
}