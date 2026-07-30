using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;

namespace Application.Common.Validation;

public static class CitizenRegistrationValidator
{
    private static readonly HashSet<char> AllowedSpecialChars =
        new("!@#$%^&*_+-=.<>?~");

    public static void Validate(RegisterCitizenRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new InvalidCitizenRegistrationRequestException("Email is required.");

        if (!EmailValidator.IsValid(request.Email))
            throw new InvalidCitizenRegistrationRequestException("Invalid email address");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new InvalidCitizenRegistrationRequestException("Password is required.");

        if (request.Password.Length < 10)
            throw new InvalidCitizenRegistrationRequestException(
                "Password must be at least 10 characters.");

        if (!request.Password.Any(char.IsUpper))
            throw new InvalidCitizenRegistrationRequestException(
                "Password must contain at least one uppercase letter.");

        if (!request.Password.Any(char.IsLower))
            throw new InvalidCitizenRegistrationRequestException(
                "Password must contain at least one lowercase letter.");

        if (!request.Password.Any(char.IsDigit))
            throw new InvalidCitizenRegistrationRequestException(
                "Password must contain at least one digit.");

        if (!request.Password.Any(c => AllowedSpecialChars.Contains(c)))
            throw new InvalidCitizenRegistrationRequestException(
                "Password must contain at least one special character (!@#$%^&*_-+=.<>?~).");
    }
}
