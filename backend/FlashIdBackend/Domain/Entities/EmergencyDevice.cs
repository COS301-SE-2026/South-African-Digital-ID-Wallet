namespace Domain.Entities;

public class EmergencyDevice : BaseEntity
{
    public Guid CitizenId { get; set; }
    public Citizen Citizen { get; set; } = null!;

    public byte[] Handle { get; set; } = [];

    public byte[] PublicKeySpki { get; set; } = [];

    public string Platform { get; set; } = "android";
    public string? DeviceLabel { get; set; }
    public bool IsStrongBoxBacked { get; set; }
    public DateTime? RevokedAt { get; set; }
}