using Domain.Enums;

namespace Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public bool PasswordSet { get; set; }

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
    public int OTPResendCount { get; private set; }

    public string? PendingEmail { get; private set; }
    public DateTime? PasswordReverifiedAt { get; set; }

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

    public void MarkPasswordReverified() => PasswordReverifiedAt = DateTime.UtcNow;

    public void ClearPasswordReverification() => PasswordReverifiedAt = null;

    public bool IsPasswordReverificationValid(int validMinutes = 10) =>
        PasswordReverifiedAt.HasValue &&
        DateTime.UtcNow <= PasswordReverifiedAt.Value.AddMinutes(validMinutes);

    public void SetPendingEmailChange(string pendingEmail, string otpHash, int expiryMinutes = 10)
    {
        PendingEmail = pendingEmail;
        OTPResendCount = 0;
        SetOtp(otpHash, expiryMinutes);
    }

    public void ClearPendingEmailChange()
    {
        PendingEmail = null;
        OTPResendCount = 0;
        ClearOtp();
    }

    public void ConfirmEmailChange()
    {
        if (PendingEmail is not null)
            Email = PendingEmail;
        ClearPendingEmailChange();
    }

    public bool TryRegisterOtpResend(string otpHash, int expiryMinutes = 10, int maxResends = 3)
    {
        if (OTPResendCount >= maxResends) return false;
        OTPResendCount++;
        SetOtp(otpHash, expiryMinutes);
        return true;
    }
}