namespace Application.Features.CertifiedCredentialCopies.Models;

public sealed class CertifiedCredentialSnapshot
{
    public Guid CredentialId { get; init; }
    public string CredentialType { get; init; } = string.Empty;
    public string IssuedBy { get; init; } = string.Empty;
    public DateTime IssueDate { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string IdNumber { get; init; } = string.Empty;
    public DateTime? DateOfBirth { get; init; }

    public string? Citizenship { get; init; }
    public string? CountryOfBirth { get; init; }
    public string? Nationality { get; init; }

    public string? LicenseNumber { get; init; }
    public string? LicenseCode { get; init; }
    public string? Restrictions { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public string? CountryOfIssue { get; init; }
gdftyftf
    public string? PhotoPath { get; init; }
}