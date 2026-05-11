namespace Domain.Entities;

public class DriversLicense
{
    public Guid Id { get; set; }
    
    public string LicenseNumber { get; set; } = string.Empty;
    
    public string LicenseCode { get; set; } = string.Empty;
    
    public string Restrictions { get; set; } = string.Empty;
    
    public DateTime StartDate { get; set; }
    
    public DateTime ExpiryDate { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    // Navigation property back to Credential
    public Guid CredentialId { get; set; }
    public Credential Credential { get; set; } = null!;
}