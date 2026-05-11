using Domain.Enums;

namespace Domain.Entities;

public class Institution
{
    public Guid Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public InstitutionType Type { get; set; }
    
    public string ApiKey { get; set; } = string.Empty;
    
    public string VerificationNumber { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    // navigation properties
    public Guid RegisteredById { get; set; }
    public GovernmentAdministrator RegisteredBy { get; set; } = null!;
    
    public ICollection<Official> Officials { get; set; } = new List<Official>();
}