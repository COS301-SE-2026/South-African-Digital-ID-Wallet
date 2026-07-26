using Domain.Enums;

namespace Domain.Entities;

public class TrustedDevice : BaseEntity
{
    public string DeviceTokenHash { get; set; } = string.Empty;

    public DeviceType DeviceType { get; set; }

    public string OperatingSystem { get; set; } = string.Empty;

    public string? Browser { get; set; } = string.Empty;

    public string? LastKnownCity { get; set; }

    public string? LastKnownCountry { get; set; }

    public DateTime LastActive { get; set; }

    public bool IsTrusted { get; set; }

    public Guid CitizenId { get; set; }

    public Citizen Citizen { get; set; } = null!;
}