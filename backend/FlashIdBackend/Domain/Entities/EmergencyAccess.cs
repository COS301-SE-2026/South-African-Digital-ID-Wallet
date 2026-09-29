namespace Domain.Entities;

public class EmergencyAccess : BaseEntity
{
    public Guid EmergencyProfileId { get; set; }
    public EmergencyProfile EmergencyProfile { get; set; } = null!;

    public Guid ResponderUserId { get; set; }

    public User? ResponderUser { get; set; }

    public string ResponderName { get; set; } = string.Empty;
    public string? ResponderInstitutionName { get; set; }

    public Guid? InstitutionId { get; set; }
    public Institution? Institution { get; set; }

    public string Justification { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? IpAddress { get; set; }

    public bool WasOffline { get; set; }
    public DateTime AccessedAt { get; set; }
    public DateTime? ContactNotifiedAt { get; set; }
}
