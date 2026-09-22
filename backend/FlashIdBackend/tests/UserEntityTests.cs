using Domain.Entities;

namespace tests;

public class UserEntityTests
{
    private const string OtpHash = "hashed-otp-111111"; // NOSONAR - test-only dummy credential, not a real secret
    private const string RotatedOtpHash = "hashed-otp-222222"; // NOSONAR - test-only dummy credential, not a real secret
    private const string OriginalEmail = "citizen@flashid.test";
    private const string PendingEmailAddress = "new.citizen@flashid.test";

    private static User CreateUser() => new() { Email = OriginalEmail };

    [Fact]
    public void SetOtp_WithDefaultExpiry_StoresHashAndSetsExpiryTenMinutesOut()
    {
        var user = CreateUser();
        var before = DateTime.UtcNow;

        user.SetOtp(OtpHash);

        Assert.Equal(OtpHash, user.EmailOTPHash);
        Assert.NotNull(user.EmailOTPExpiresAt);
        Assert.InRange(user.EmailOTPExpiresAt!.Value, before.AddMinutes(10), DateTime.UtcNow.AddMinutes(10));
    }

    [Fact]
    public void SetOtp_WithExplicitExpiry_HonoursThatExpiry()
    {
        var user = CreateUser();
        var before = DateTime.UtcNow;

        user.SetOtp(OtpHash, 5);

        Assert.InRange(user.EmailOTPExpiresAt!.Value, before.AddMinutes(5), DateTime.UtcNow.AddMinutes(5));
    }

    [Fact]
    public void SetOtp_AfterFailedAttempts_ResetsAttemptCount()
    {
        var user = CreateUser();
        user.SetOtp(OtpHash);
        user.IncrementOtpAttempt();
        user.IncrementOtpAttempt();

        user.SetOtp(RotatedOtpHash);

        Assert.Equal(0, user.OTPAttemptCount);
        Assert.Equal(RotatedOtpHash, user.EmailOTPHash);
    }

    [Fact]
    public void ClearOtp_AfterOtpSet_ClearsHashExpiryAndAttempts()
    {
        var user = CreateUser();
        user.SetOtp(OtpHash);
        user.IncrementOtpAttempt();

        user.ClearOtp();

        Assert.Null(user.EmailOTPHash);
        Assert.Null(user.EmailOTPExpiresAt);
        Assert.Equal(0, user.OTPAttemptCount);
    }

    [Fact]
    public void MarkEmailVerified_WithOutstandingOtp_SetsVerifiedAndClearsOtp()
    {
        var user = CreateUser();
        user.SetOtp(OtpHash);

        user.MarkEmailVerified();

        Assert.True(user.IsEmailVerified);
        Assert.Null(user.EmailOTPHash);
        Assert.Null(user.EmailOTPExpiresAt);
    }

    [Fact]
    public void IncrementOtpAttempt_CalledThreeTimes_CountsEachAttempt()
    {
        var user = CreateUser();

        user.IncrementOtpAttempt();
        user.IncrementOtpAttempt();
        user.IncrementOtpAttempt();

        Assert.Equal(3, user.OTPAttemptCount);
    }

    [Fact]
    public void IsOtpExpired_WhenNoOtpEverSet_ReturnsTrue()
    {
        var user = CreateUser();

        Assert.True(user.IsOtpExpired());
    }

    [Fact]
    public void IsOtpExpired_WhenExpiryInFuture_ReturnsFalse()
    {
        var user = CreateUser();
        user.SetOtp(OtpHash);

        Assert.False(user.IsOtpExpired());
    }

    [Fact]
    public void IsOtpExpired_WhenExpiryInPast_ReturnsTrue()
    {
        var user = CreateUser();
        user.SetOtp(OtpHash, -1);

        Assert.True(user.IsOtpExpired());
    }

    [Fact]
    public void MarkPasswordReverified_SetsReverificationTimestamp()
    {
        var user = CreateUser();
        var before = DateTime.UtcNow;

        user.MarkPasswordReverified();

        Assert.NotNull(user.PasswordReverifiedAt);
        Assert.InRange(user.PasswordReverifiedAt!.Value, before, DateTime.UtcNow);
    }

    [Fact]
    public void ClearPasswordReverification_AfterReverification_ClearsTimestamp()
    {
        var user = CreateUser();
        user.MarkPasswordReverified();

        user.ClearPasswordReverification();

        Assert.Null(user.PasswordReverifiedAt);
    }

    [Fact]
    public void IsPasswordReverificationValid_WhenNeverReverified_ReturnsFalse()
    {
        var user = CreateUser();

        Assert.False(user.IsPasswordReverificationValid());
    }

    [Theory]
    [InlineData(0, true)]
    [InlineData(-9, true)]
    [InlineData(-11, false)]
    public void IsPasswordReverificationValid_DependsOnAgeOfReverification(int minutesAgo, bool expected)
    {
        var user = CreateUser();
        user.PasswordReverifiedAt = DateTime.UtcNow.AddMinutes(minutesAgo);

        Assert.Equal(expected, user.IsPasswordReverificationValid());
    }

    [Fact]
    public void SetPendingEmailChange_StoresPendingEmailAndIssuesOtp()
    {
        var user = CreateUser();

        user.SetPendingEmailChange(PendingEmailAddress, OtpHash);

        Assert.Equal(PendingEmailAddress, user.PendingEmail);
        Assert.Equal(OtpHash, user.EmailOTPHash);
        Assert.Equal(OriginalEmail, user.Email);
        Assert.False(user.IsOtpExpired());
    }

    [Fact]
    public void ClearPendingEmailChange_AfterPendingChange_ClearsPendingEmailAndOtp()
    {
        var user = CreateUser();
        user.SetPendingEmailChange(PendingEmailAddress, OtpHash);

        user.ClearPendingEmailChange();

        Assert.Null(user.PendingEmail);
        Assert.Null(user.EmailOTPHash);
        Assert.Null(user.EmailOTPExpiresAt);
        Assert.Equal(OriginalEmail, user.Email);
    }

    [Fact]
    public void ConfirmEmailChange_WithPendingEmail_PromotesPendingEmailAndClearsPendingState()
    {
        var user = CreateUser();
        user.SetPendingEmailChange(PendingEmailAddress, OtpHash);

        user.ConfirmEmailChange();

        Assert.Equal(PendingEmailAddress, user.Email);
        Assert.Null(user.PendingEmail);
        Assert.Null(user.EmailOTPHash);
    }

    [Fact]
    public void ConfirmEmailChange_WithNoPendingEmail_LeavesEmailUnchanged()
    {
        var user = CreateUser();

        user.ConfirmEmailChange();

        Assert.Equal(OriginalEmail, user.Email);
        Assert.Null(user.PendingEmail);
    }

    [Fact]
    public void TryRegisterOtpResend_WithinLimit_ReturnsTrueAndRotatesOtpHash()
    {
        var user = CreateUser();
        user.SetPendingEmailChange(PendingEmailAddress, OtpHash);

        var result = user.TryRegisterOtpResend(RotatedOtpHash);

        Assert.True(result);
        Assert.Equal(RotatedOtpHash, user.EmailOTPHash);
    }

    [Fact]
    public void TryRegisterOtpResend_UpToThreeTimes_AllowsEachThenRefusesTheFourth()
    {
        var user = CreateUser();
        user.SetPendingEmailChange(PendingEmailAddress, OtpHash);

        Assert.True(user.TryRegisterOtpResend(RotatedOtpHash));
        Assert.True(user.TryRegisterOtpResend(RotatedOtpHash));
        Assert.True(user.TryRegisterOtpResend(RotatedOtpHash));
        Assert.False(user.TryRegisterOtpResend(OtpHash));
    }

    [Fact]
    public void TryRegisterOtpResend_WhenRefused_LeavesExistingOtpIntact()
    {
        var user = CreateUser();
        user.SetPendingEmailChange(PendingEmailAddress, OtpHash);
        user.TryRegisterOtpResend(RotatedOtpHash);
        user.TryRegisterOtpResend(RotatedOtpHash);
        user.TryRegisterOtpResend(RotatedOtpHash);

        var result = user.TryRegisterOtpResend(OtpHash);

        Assert.False(result);
        Assert.Equal(RotatedOtpHash, user.EmailOTPHash);
    }

    [Fact]
    public void SetPendingEmailChange_AfterResendsExhausted_RestoresResendAllowance()
    {
        var user = CreateUser();
        user.SetPendingEmailChange(PendingEmailAddress, OtpHash);
        user.TryRegisterOtpResend(RotatedOtpHash);
        user.TryRegisterOtpResend(RotatedOtpHash);
        user.TryRegisterOtpResend(RotatedOtpHash);

        user.SetPendingEmailChange(PendingEmailAddress, OtpHash);

        Assert.True(user.TryRegisterOtpResend(RotatedOtpHash));
    }

    [Fact]
    public void ClearPendingEmailChange_AfterResendsExhausted_RestoresResendAllowance()
    {
        var user = CreateUser();
        user.SetPendingEmailChange(PendingEmailAddress, OtpHash);
        user.TryRegisterOtpResend(RotatedOtpHash);
        user.TryRegisterOtpResend(RotatedOtpHash);
        user.TryRegisterOtpResend(RotatedOtpHash);

        user.ClearPendingEmailChange();
        user.SetPendingEmailChange(PendingEmailAddress, OtpHash);

        Assert.True(user.TryRegisterOtpResend(RotatedOtpHash));
    }
}
