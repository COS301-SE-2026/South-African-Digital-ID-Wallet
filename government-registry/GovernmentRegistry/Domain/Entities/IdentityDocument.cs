using Domain.Enums;

namespace Domain.Entities;

public class IdentityDocument : Credential
{
    public string CountryOfBirth { get; set; } = string.Empty;

    public CitizenStatus CitizenshipStatus { get; set; }

    public string Nationality { get; set; } = string.Empty;

    public string PhotoBlob { get; set; } = string.Empty;
}