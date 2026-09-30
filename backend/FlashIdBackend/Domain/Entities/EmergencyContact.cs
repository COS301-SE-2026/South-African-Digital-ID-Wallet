namespace Domain.Entities;

public class EmergencyContact : BaseEntity
{
    public Guid EmergencyProfileId { get; set; }
    public EmergencyProfile EmergencyProfile { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Relationship { get; set; } = string.Empty;

    public string? Email { get; set; }
    public string? Phone { get; set; }

    public int Priority { get; set; }
}
