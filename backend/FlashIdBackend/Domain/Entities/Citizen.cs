namespace Domain.Entities;

using Domain.Enums;

public class Citizen : BaseEntity
{
    public string SaId { get; set; } = string.Empty;

    public string Names { get; set; } = string.Empty;

    public string Surname { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }

    public Gender Gender { get; set; } = Gender.Unspecified;

    public string? CredentialActivationCode { get; set; }

    public DateTime? CredentialActivationCodeExpiresAt { get; set; }

    public CitizenStatus Status { get; set; }

    // navigation properties
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public ICollection<Credential> Credentials { get; set; } = new List<Credential>();
}