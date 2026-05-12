using Domain.Enums;

namespace Domain.Entities;

public class Credential
{
    public Guid Id { get; set; }
    
    public CredentialStatus Status { get; set; }
    
    public string Signature { get; set; } = string.Empty;
    
    public string IssuedBy { get; set; } = string.Empty;
    
    public DateTime DateOfBirth { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    // navigation properties
    public Guid CitizenId { get; set; }
    public Citizen Citizen { get; set; } = null!;
    
    // one credential is either an IdentityDocument or a DriversLicense
    public IdentityDocument? IdentityDocument { get; set; }
    public DriversLicense? DriversLicense { get; set; }
    public Biometrics? Biometrics { get; set; }
}