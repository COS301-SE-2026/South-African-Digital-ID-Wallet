namespace Domain.Entities;

public class DeviceVerification : BaseEntity
{
    public Guid CitizenId { get; set; }
    public string OtpHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public int AttemptCount { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public Citizen Citizen { get; set; } = null!;
}