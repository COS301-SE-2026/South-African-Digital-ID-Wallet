using Domain.Enums;

namespace Application.Features.Auth.DTOs;

public class VerifyDeviceRequestDto
{
    public Guid DeviceVerificationId { get; set; }
    public string Otp { get; set; } = string.Empty;
    public DeviceType DeviceType { get; set; }
    public string OperatingSystem { get; set; } = string.Empty;
    public string Browser { get; set; } = string.Empty;
    public bool RememberMe { get; set; }
    public string? DeviceName { get; set; }
}