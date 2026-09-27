namespace Application.Features.CertifiedCredentialCopies.DTOs;

public class VerifyCertifiedCopyResponseDto
{
    public bool IsValid { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid CertificationId { get; set; }
    public DateTime GeneratedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }

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
}