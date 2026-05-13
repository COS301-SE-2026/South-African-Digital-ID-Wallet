namespace Domain.Entities;

public class Citizen : BaseEntity
{
    public string SaId { get; set; } = string.Empty;

    public string ActivationCode { get; set; } = string.Empty;

    public DateTime? ActivationCodeExpiresAt { get; set; }

    public bool IsActivated { get; set; }

    // navigation properties
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<Credential> Credentials { get; set; } = new List<Credential>();
}