namespace Application.Features.TrustedDevices.DTOs;

public class TrustedDeviceDto
{
    public Guid Id { get; set; }

    public string DeviceName { get; set; } = string.Empty;

    public string DeviceType { get; set; } = string.Empty;

    public string OperatingSystem { get; set; } = string.Empty;

    public string Browser { get; set; } = string.Empty;

    public string? LastKnownCity { get; set; }

    public string? LastKnownCountry { get; set; }

    public DateTime LastActive { get; set; }

    public bool IsCurrentDevice { get; set; }

    public bool IsTrusted { get; set; }
}