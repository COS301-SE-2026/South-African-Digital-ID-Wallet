using Domain.Enums;

namespace Domain.Entities;

public class DriversLicense : Credential
{


    public string LicenseNumber { get; set; } = string.Empty;

    public LicenseCode LicenseCode { get; set; } = LicenseCode.Unspecified;

    public string? Restrictions { get; set; }

    public DateOnly ExpiryDate { get; set; }

    public string PhotoBlob { get; set; } = string.Empty;


}