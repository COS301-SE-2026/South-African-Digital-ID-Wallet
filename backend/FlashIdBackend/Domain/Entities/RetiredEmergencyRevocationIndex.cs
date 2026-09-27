namespace Domain.Entities;

public class RetiredEmergencyRevocationIndex
{
    public Guid Id { get; set; }

    public int RevocationIndex { get; set; }

    public Guid EmergencyProfileId { get; set; }

    public DateTime RetiredAt { get; set; }
}
