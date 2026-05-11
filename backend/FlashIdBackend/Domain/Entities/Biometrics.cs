namespace Domain.Entities;

public class Biometrics
{
    public Guid Id { get; set; }
    
    public string FaceHash { get; set; } = string.Empty;
    
    public string FingerprintHash { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    // navigation property back to Credential
    public Guid CredentialId { get; set; }
    public Credential Credential { get; set; } = null!;
}