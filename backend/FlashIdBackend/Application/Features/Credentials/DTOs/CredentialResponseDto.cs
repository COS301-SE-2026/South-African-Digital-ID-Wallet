namespace Application.Features.Credentials.DTOs;

public class IdentityDocumentDetailDto
{
    public string Nationality { get; set; } = string.Empty;
    public string Citizenship { get; set; } = string.Empty;
    public string CountryOfBirth { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class DriversLicenseDetailDto
{
    public string LicenseNumber { get; set; } = string.Empty;
    public string LicenseCode { get; set; } = string.Empty;
    public string Restrictions { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
}

public class CredentialResponseDto
{
    public Guid Id { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string IssuedBy { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime IssueDate { get; set; }

    public IdentityDocumentDetailDto? IdentityDocument { get; set; }
    public DriversLicenseDetailDto? DriversLicense { get; set; }
}