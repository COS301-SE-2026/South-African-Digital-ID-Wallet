using Domain.Enums;

namespace Domain.Entities;

public class DriversLicense
{
    public Guid Id { get; set; }
    
    public string LicenseNumber { get; set; } = string.Empty;

    public LicenseCode LicenseCode { get; set; } = LicenseCode.Unspecified;

    public string? Restrictions { get; set; } = string.Empty;

    public DateOnly ExpiryDate { get; set; }

    public string PhotoHash { get; set; } = string.Empty;
    
    // Navigation property back to Credential
    public Guid CredentialId { get; set; }
    public Credential Credential { get; set; } = null!;
}