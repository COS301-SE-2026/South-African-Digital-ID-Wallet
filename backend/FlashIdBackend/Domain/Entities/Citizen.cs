namespace Domain.Entities;

using Domain.Enums;

public class Citizen : BaseEntity
{
    public string SaId { get; set; } = string.Empty;

    public string Names { get; set; } = string.Empty;

    public string Surname { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }

    public string? ActivationCode { get; set; }

    public DateTime? ActivationCodeExpiresAt { get; set; }

    public CitizenStatus Status { get; set; }

    public string? IdFrontImagePath { get; set; }

    public string? IdBackImagePath { get; set; }

    public string? SelfieImagePath { get; set; }

    // navigation properties
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<Credential> Credentials { get; set; } = new List<Credential>();
}