using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;

namespace Application.Common.Validation;

public static class CitizenRegistrationValidator
{
    private static readonly HashSet<char> AllowedSpecialChars =
        new("!@#$%^&*_+-=.<>?~");

    public static void Validate(RegisterCitizenRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.SaId))
            throw new InvalidCitizenRegistrationRequestException("SA ID number is required.");

        if (request.SaId.Length != 13 || !request.SaId.All(char.IsDigit))
            throw new InvalidCitizenRegistrationRequestException(
                "SA ID number must be exactly 13 digits.");

        if (string.IsNullOrWhiteSpace(request.Username))
            throw new InvalidCitizenRegistrationRequestException("Username is required.");

        if (request.Username.Length < 8)
            throw new InvalidCitizenRegistrationRequestException(
                "Username must be at least 8 characters.");

        if (request.Username.Any(char.IsWhiteSpace))
            throw new InvalidCitizenRegistrationRequestException(
                "Username must not contain spaces.");

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

        if (string.IsNullOrWhiteSpace(request.ActivationCode))
            throw new InvalidCitizenRegistrationRequestException("Activation code is required.");
    }
}
