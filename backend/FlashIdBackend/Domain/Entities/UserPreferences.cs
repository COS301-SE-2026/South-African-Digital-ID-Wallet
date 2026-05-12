namespace Domain.Entities;

public class UserPreferences
{
    public Guid Id { get; set; }
    
    public string PreferredName { get; set; } = string.Empty;
    
    public string Theme { get; set; } = string.Empty;
    
    public bool PreferredDisclosure { get; set; } = false;
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    // navigation property back to User
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}