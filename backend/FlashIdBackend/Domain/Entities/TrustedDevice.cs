using Domain.Enums;

namespace Domain.Entities;

public class TrustedDevice : BaseEntity
{
    public string DeviceName { get; set; } = string.Empty;

    public string DeviceType { get; set; } = string.Empty;

    public string OperatingSystem { get; set; } = string.Empty;

    public string Browser { get; set; } = string.Empty;

    public string IpAddress { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public DateTime LastActive { get; set; }

    public bool IsCurrentDevice { get; set; }

    public bool IsTrusted { get; set; }

    public Guid CitizenId { get; set; }

    public Citizen Citizen { get; set; }
}