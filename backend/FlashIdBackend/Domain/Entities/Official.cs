namespace Domain.Entities;

public class Official
{
    public Guid Id { get; set; }

    public string OfficialId { get; set; } = string.Empty;

    public string Names { get; set; } = string.Empty;

    public string Surname { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // navigation properties
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid InstitutionId { get; set; }
    public Institution Institution { get; set; } = null!;
}