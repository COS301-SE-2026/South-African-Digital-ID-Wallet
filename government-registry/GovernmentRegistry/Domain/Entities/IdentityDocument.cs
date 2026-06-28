using Domain.Enums;

namespace Domain.Entities;

public class IdentityDocument : Credential
{
    public Guid UserId { get; set; }
   
    public string IdNumber { get; set; } = string.Empty;
    
    public string Citizenship { get; set; } = string.Empty;

    public string CountryOfBirth { get; set; } = string.Empty;

    public CitizenStatus Status { get; set; }

    public string Nationality { get; set; } = string.Empty;

    public string PhotoHash { get; set; } = string.Empty;

    // Navigation property back to Credential
    public Guid CredentialId { get; set; }
    public Credential Credential { get; set; } = null!;
}