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

        ValidatePassword(request.Password);
    }

    // Shared by registration and password reset so the password rules cannot drift apart.
    public static void ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new InvalidCitizenRegistrationRequestException("Password is required.");

        if (password.Length < 10)
            throw new InvalidCitizenRegistrationRequestException(
                "Password must be at least 10 characters.");

        if (!password.Any(char.IsUpper))
            throw new InvalidCitizenRegistrationRequestException(
                "Password must contain at least one uppercase letter.");

        if (!password.Any(char.IsLower))
            throw new InvalidCitizenRegistrationRequestException(
                "Password must contain at least one lowercase letter.");

        if (!password.Any(char.IsDigit))
            throw new InvalidCitizenRegistrationRequestException(
                "Password must contain at least one digit.");

        if (!password.Any(c => AllowedSpecialChars.Contains(c)))
            throw new InvalidCitizenRegistrationRequestException(
                "Password must contain at least one special character (!@#$%^&*_-+=.<>?~).");
    }
}