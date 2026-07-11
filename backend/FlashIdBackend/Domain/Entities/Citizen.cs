namespace Domain.Entities;

using Domain.Enums;

public class Citizen : BaseEntity
{
    public string SaId { get; set; } = string.Empty;

    public string Names { get; set; } = string.Empty;

    public string Surname { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }

    public Gender Gender { get; set; } = Gender.Unspecified;

    public CitizenStatus Status { get; set; }

    public DateTime? ActivatedAt { get; set; }

    public ICollection<CitizenActivation> Activations { get; set; }
        = new List<CitizenActivation>();

    // navigation properties
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public ICollection<Credential> Credentials { get; set; } = new List<Credential>();
}