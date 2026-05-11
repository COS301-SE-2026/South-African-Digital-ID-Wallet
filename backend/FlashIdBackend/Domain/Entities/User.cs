using Domain.Enums;

namespace Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    
    public string Names { get; set; } = string.Empty;
    
    public string Surname { get; set; } = string.Empty;
    
    public string Email { get; set; } = string.Empty;
    
    public string PhoneNumber { get; set; } = string.Empty;
    
    public string Username { get; set; } = string.Empty;
    
    public string PasswordHash { get; set; } = string.Empty;
    
    public int FailedLoginAttempts { get; set; }

    public bool IsDeleted { get; set; } = false;
    
    public UserRole Role { get; set; } 
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    //navigation properties 
    public UserPreferences? Preference { get; set; }
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

}