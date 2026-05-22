namespace Domain.Entities;

using Domain.Enums;

public class DriversLicense : BaseEntity
{
    public string LicenseNumber { get; set; } = string.Empty;

    public LicenseCode LicenseCode { get; set; } = LicenseCode.Unspecified;

    public string Restrictions { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime ExpiryDate { get; set; }


    // Navigation property back to Credential
    public Guid CredentialId { get; set; }
    public Credential Credential { get; set; } = null!;
}