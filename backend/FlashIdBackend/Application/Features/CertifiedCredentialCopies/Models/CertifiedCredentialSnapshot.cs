namespace Application.Features.CertifiedCredentialCopies.Models;

public sealed class CertifiedCredentialSnapshot
{
    public Guid CredentialId { get; set; }
    public string CredentialType { get; set; } = string.Empty;
    public string IssuedBy { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string IdNumber { get; set; } = string.Empty;
    public DateTime? DateOfBirth { get; set; }

    public string? Citizenship { get; set; }
    public string? CountryOfBirth { get; set; }
    public string? Nationality { get; set; }

    public string? LicenseNumber { get; set; }
    public string? LicenseCode { get; set; }
    public string? Restrictions { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CountryOfIssue { get; set; }

    public string? PhotoPath { get; set; }
}