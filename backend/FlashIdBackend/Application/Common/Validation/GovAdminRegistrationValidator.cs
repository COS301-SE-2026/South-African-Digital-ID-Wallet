using Application.Features.GovernmentAdministrators.DTOs;
using Application.Features.GovernmentAdministrators.Exceptions;

namespace Application.Common.Validation;

public static class GovAdminRegistrationValidator
{
    public static void Validate(RegisterGovAdminRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.GovernmentId))
            throw new InvalidGovAdminRequestException("Government ID is required.");

        if (request.GovernmentId.Length > 20)
            throw new InvalidGovAdminRequestException("Government ID cannot exceed 20 characters.");

        if (string.IsNullOrWhiteSpace(request.FirstName))
            throw new InvalidGovAdminRequestException("First name is required.");

        if (string.IsNullOrWhiteSpace(request.LastName))
            throw new InvalidGovAdminRequestException("Last name is required.");

        if (string.IsNullOrWhiteSpace(request.Email))
            throw new InvalidGovAdminRequestException("Email address is required.");

        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            throw new InvalidGovAdminRequestException("Phone number is required.");

        if (string.IsNullOrWhiteSpace(request.Username))
            throw new InvalidGovAdminRequestException("Username is required.");

        if (request.Username.Length < 8)
            throw new InvalidGovAdminRequestException("Username must be at least 8 characters.");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new InvalidGovAdminRequestException("Password is required.");

        if (request.Password.Length < 10)
            throw new InvalidGovAdminRequestException("Password must be at least 10 characters.");

        if (!request.Password.Any(char.IsUpper))
            throw new InvalidGovAdminRequestException("Password must contain at least one uppercase letter.");

        if (!request.Password.Any(char.IsLower))
            throw new InvalidGovAdminRequestException("Password must contain at least one lowercase letter.");

        if (!request.Password.Any(char.IsDigit))
            throw new InvalidGovAdminRequestException("Password must contain at least one digit.");
    }
}
