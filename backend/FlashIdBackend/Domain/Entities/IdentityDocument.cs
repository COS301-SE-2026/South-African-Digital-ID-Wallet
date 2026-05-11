namespace Domain.Entities;

public class IdentityDocument
{
    public Guid Id { get; set; }
    
    public string Gender { get; set; } = string.Empty;
    
    public string Citizenship { get; set; } = string.Empty;
    
    public DateTime DateOfBirth { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    // Navigation property back to Credential
    public Guid CredentialId { get; set; }
    public Credential Credential { get; set; } = null!;
}