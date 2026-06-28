using Domain.Enums;

namespace Domain.Entities;

public class DriversLicense
{
    public string LicenseNumber { get; set; } = string.Empty;

    public string VehicleClass { get; set; } = string.Empty;

    public LicenseCode LicenseCode { get; set; } = LicenseCode.Unspecified;

    public string Restrictions { get; set; } = string.Empty;

    public DateOnly StartDate { get; set; }

    public DateOnly ExpiryDate { get; set; }


    // Navigation property back to Credential
    public Guid CredentialId { get; set; }
    public Credential Credential { get; set; } = null!;
}