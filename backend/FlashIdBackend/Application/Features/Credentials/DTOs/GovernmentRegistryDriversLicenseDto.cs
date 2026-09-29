namespace Application.Features.Credentials.DTOs;

public class GovernmentRegistryDriversLicenseDto
{
    public Guid CredentialId { get; set; }
    public string Signature { get; set; } = string.Empty;
    public string IssuedBy { get; set; } = string.Empty;
    public DateOnly IssueDate { get; set; }
    public string LicenseNumber { get; set; } = string.Empty;
    public string LicenseCode { get; set; } = string.Empty;
    public string Restrictions { get; set; } = string.Empty;
    public DateOnly ExpiryDate { get; set; }
    public string PhotoBlob { get; set; } = string.Empty;
}