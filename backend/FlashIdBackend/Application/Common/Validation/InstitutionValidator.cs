using System.Text.RegularExpressions;
using Application.Features.Institutions.DTOs;
using Application.Features.Institutions.Exceptions;

namespace Application.Common.Validation;

public static class InstitutionValidator
{
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled
    );
    public static void Validate(RegisterInstitutionRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new InvalidInstitutionRequestException("Institution name is required.");

        if (request.Name.Length > 256)
            throw new InvalidInstitutionRequestException(
                "Institution name cannot exceed 256 characters."
            );

        if (string.IsNullOrWhiteSpace(request.VerificationNumber))
            throw new InvalidInstitutionRequestException("Verification number is required.");

        if (request.VerificationNumber.Length > 100)
            throw new InvalidInstitutionRequestException(
                "Verification number cannot exceed 100 characters."
            );

        if (string.IsNullOrWhiteSpace(request.ContactEmail))
            throw new InvalidInstitutionRequestException("Contact email is required.");

        if (request.ContactEmail.Length > 256)
            throw new InvalidInstitutionRequestException(
                "Contact email cannot exceed 256 characters."
            );
        if (!EmailRegex.IsMatch(request.ContactEmail))
            throw new InvalidInstitutionRequestException("Contact email is not a valid email address.");

        if (request.AdminId == Guid.Empty)
            throw new InvalidInstitutionRequestException("A valid admin ID is required.");
    }
}