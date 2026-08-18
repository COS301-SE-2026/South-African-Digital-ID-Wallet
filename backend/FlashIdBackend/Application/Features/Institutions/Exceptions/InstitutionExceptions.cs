namespace Application.Features.Institutions.Exceptions;

public class InstitutionAlreadyExistsException : Exception
{
    public InstitutionAlreadyExistsException(string verificationNumber)
        : base(
            $"An institution with verification number '{verificationNumber}' already exists."
        )
    { }
}

public class AdminNotFoundException : Exception
{
    public AdminNotFoundException(Guid adminId)
        : base($"Government administrator with ID '{adminId}' was not found.") { }
}

public class InvalidInstitutionRequestException : Exception
{
    public InvalidInstitutionRequestException(string message)
        : base(message) { }
}

public class InvalidApiKeyRevealTokenException : Exception
{
    public InvalidApiKeyRevealTokenException(string message)
        : base(message) { }
}