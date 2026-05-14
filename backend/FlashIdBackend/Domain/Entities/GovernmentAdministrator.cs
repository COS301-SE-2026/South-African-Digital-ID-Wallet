namespace Domain.Entities;

public class GovernmentAdministrator
{
    public Guid Id { get; set; }

    public string GovernmentId { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // navigation properties
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<Institution> RegisteredInstitutions { get; set; } = new List<Institution>();
}