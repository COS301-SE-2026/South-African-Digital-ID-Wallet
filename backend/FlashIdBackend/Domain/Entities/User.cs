using Domain.Enums;

namespace Domain.Entities;

public class User : BaseEntity
{
    public string Names { get; set; } = string.Empty;

    public string Surname { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public int FailedLoginAttempts { get; set; }

    // account lockout and audit fields
    public DateTime? LockoutUntil { get; set; }
    public DateTime? LastLoginAt { get; set; }

    public bool IsDeleted { get; set; }
    public bool IsEmailVerified { get; set; }

    public UserRole Role { get; set; }

    //navigation properties 
    public UserPreferences? Preference { get; set; }
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    //for otp
    public string? EmailOTPHash { get; private set; }
    public DateTime? EmailOTPExpiresAt { get; private set; }
    public int OTPAttemptCount { get; private set; }

    public void SetOtp(string otpHash, int expiryMinutes = 10)
    {
        EmailOTPHash = otpHash;
        EmailOTPExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);
        OTPAttemptCount = 0;
    }

    public void ClearOtp()
    {
        EmailOTPHash = null;
        EmailOTPExpiresAt = null;
        OTPAttemptCount = 0;
    }

    public void MarkEmailVerified()
    {
        IsEmailVerified = true;
        ClearOtp();
    }

    public void IncrementOtpAttempt() => OTPAttemptCount++;

    public bool IsOtpExpired() => EmailOTPExpiresAt is null || DateTime.UtcNow > EmailOTPExpiresAt;
}