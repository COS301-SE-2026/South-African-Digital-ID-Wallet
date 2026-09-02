using System.Text.Json.Serialization;

namespace Application.Features.Auth.DTOs;

public class LoginResponseDto
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Token { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;

    public bool RequiresDeviceVerification { get; set; }
    public Guid? DeviceVerificationId { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? DeviceToken { get; set; }

    public string? Names { get; set; }
    public string? Surname { get; set; }
}