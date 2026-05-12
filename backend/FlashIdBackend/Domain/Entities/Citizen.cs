namespace Domain.Entities;

public class Citizen
{
    public Guid Id { get; set; }
    
    public string SaId { get; set; } = string.Empty;
    
    public string ActivationCode { get; set; } = string.Empty;
    
    public bool IsActivated { get; set; } = false;
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    // navigation properties
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public ICollection<Credential> Credentials { get; set; } = new List<Credential>();
}