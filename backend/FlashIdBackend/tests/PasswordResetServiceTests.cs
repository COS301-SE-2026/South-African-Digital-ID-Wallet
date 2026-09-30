using System.Text.RegularExpressions;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.Auth.DTOs;
using Application.Features.Citizens.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class PasswordResetServiceTests
{
    private const string Email = "thabo@example.com";
    private const string Otp = "123456";
    private const string NewPassword = "BrandNewPwd456!"; // NOSONAR - not a real secret

    private sealed class FakeAuthRepository : IAuthRepository
    {
        public User? UserToReturn;
        public List<AuditLog> AuditLogs = [];
        public int Saves;

        public Task<User?> GetUserByEmailAsync(string email) => Task.FromResult(UserToReturn?.Email == email ? UserToReturn : null);
        public Task<User?> GetUserByIdAsync(Guid userId) => Task.FromResult(UserToReturn);
        public Task<Citizen?> GetCitizenByUserIdAsync(Guid userId) => Task.FromResult<Citizen?>(null);
        public Task UpdateUserAsync(User user) => Task.CompletedTask;

        public Task AddAuditLogAsync(AuditLog auditLog)
        {
            AuditLogs.Add(auditLog);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync()
        {
            Saves++;
            return Task.CompletedTask;
        }
    }

    private sealed class FakePasswordHashingProvider : IPasswordHashingProvider
    {
        public string HashPassword(string password) => $"hashed-{password}";
        public bool VerifyPassword(string password, string storedHash) => storedHash == $"hashed-{password}";
    }

    private sealed class FakeEmailSender : IEmailSenderProvider
    {
        public List<(string To, string Message)> Sent = [];

        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default)
        {
            Sent.Add((toEmail, message));
            return Task.CompletedTask;
        }
    }

    private readonly FakeAuthRepository _repository = new();
    private readonly FakeEmailSender _emailSender = new();
    private readonly PasswordResetService _service;

    public PasswordResetServiceTests()
    {
        _service = new PasswordResetService(_repository, new FakePasswordHashingProvider(), _emailSender);
    }

    private User UserWithOtp(int expiryMinutes = 15)
    {
        var user = new User { Id = Guid.NewGuid(), Email = Email, PasswordHash = "hashed-OldPassword1!", TokenVersion = 3 };
        user.SetOtp($"hashed-{Otp}", expiryMinutes);
        _repository.UserToReturn = user;
        return user;
    }

    private static ResetPasswordRequestDto ResetRequest(string otp = Otp, string newPassword = NewPassword, string? confirm = null) => new()
    {
        Email = Email,
        Otp = otp,
        NewPassword = newPassword,
        ConfirmPassword = confirm ?? newPassword,
    };

    [Fact]
    public async Task RequestResetAsync_UnknownEmail_SendsNothing()
    {
        await _service.RequestResetAsync(new ForgotPasswordRequestDto { Email = "nobody@example.com" });

        Assert.Empty(_emailSender.Sent);
        Assert.Equal(0, _repository.Saves);
    }

    [Fact]
    public async Task RequestResetAsync_DeletedUser_SendsNothing()
    {
        _repository.UserToReturn = new User { Email = Email, IsDeleted = true };

        await _service.RequestResetAsync(new ForgotPasswordRequestDto { Email = Email });

        Assert.Empty(_emailSender.Sent);
    }

    [Fact]
    public async Task RequestResetAsync_KnownEmail_StoresHashOfTheEmailedCode()
    {
        var user = new User { Email = Email };
        _repository.UserToReturn = user;

        await _service.RequestResetAsync(new ForgotPasswordRequestDto { Email = $"  {Email} " });

        var sent = Assert.Single(_emailSender.Sent);
        Assert.Equal(Email, sent.To);
        var code = Regex.Match(sent.Message, @">(\d{6})<").Groups[1].Value;
        Assert.Equal($"hashed-{code}", user.EmailOTPHash);
        Assert.False(user.IsOtpExpired());
        Assert.Equal(1, _repository.Saves);
    }

    [Fact]
    public async Task RequestResetAsync_RepeatWithinCooldown_KeepsTheFirstCodeAndSendsOneEmail()
    {
        var user = new User { Email = Email };
        _repository.UserToReturn = user;

        await _service.RequestResetAsync(new ForgotPasswordRequestDto { Email = Email });
        var firstHash = user.EmailOTPHash;
        await _service.RequestResetAsync(new ForgotPasswordRequestDto { Email = Email });

        Assert.Single(_emailSender.Sent);
        Assert.Equal(firstHash, user.EmailOTPHash);
        Assert.Equal(1, _repository.Saves);
    }

    [Fact]
    public async Task RequestResetAsync_AfterCooldown_SendsANewCode()
    {
        var user = UserWithOtp(expiryMinutes: 13);

        await _service.RequestResetAsync(new ForgotPasswordRequestDto { Email = Email });

        Assert.Single(_emailSender.Sent);
        Assert.NotEqual($"hashed-{Otp}", user.EmailOTPHash);
    }

    [Fact]
    public async Task ResetPasswordAsync_ValidCode_ChangesPasswordAndRevokesSessions()
    {
        var user = UserWithOtp();
        user.FailedLoginAttempts = 4;
        user.LockoutUntil = DateTime.UtcNow.AddMinutes(10);

        await _service.ResetPasswordAsync(ResetRequest(), "10.0.0.1");

        Assert.Equal($"hashed-{NewPassword}", user.PasswordHash);
        Assert.Equal(4, user.TokenVersion);
        Assert.Equal(0, user.FailedLoginAttempts);
        Assert.Null(user.LockoutUntil);
        Assert.Null(user.EmailOTPHash);
        Assert.True(user.IsEmailVerified);
        var audit = Assert.Single(_repository.AuditLogs);
        Assert.Equal(AuditEventType.PasswordReset, audit.EventType);
        Assert.Equal(user.Id, audit.ActorId);
        Assert.Equal("10.0.0.1", audit.IpAddress);
    }

    [Fact]
    public async Task ResetPasswordAsync_WrongCode_CountsTheAttempt()
    {
        var user = UserWithOtp();

        await Assert.ThrowsAsync<InvalidOtpException>(() => _service.ResetPasswordAsync(ResetRequest(otp: "000000"), "ip"));

        Assert.Equal(1, user.OTPAttemptCount);
        Assert.Equal("hashed-OldPassword1!", user.PasswordHash);
    }

    [Fact]
    public async Task ResetPasswordAsync_ExpiredCode_Throws()
    {
        UserWithOtp(expiryMinutes: -1);

        await Assert.ThrowsAsync<OtpExpiredException>(() => _service.ResetPasswordAsync(ResetRequest(), "ip"));
    }

    [Fact]
    public async Task ResetPasswordAsync_TooManyAttempts_ThrowsEvenForTheRightCode()
    {
        var user = UserWithOtp();
        for (var i = 0; i < 5; i++) user.IncrementOtpAttempt();

        await Assert.ThrowsAsync<TooManyOtpAttemptsException>(() => _service.ResetPasswordAsync(ResetRequest(), "ip"));
    }

    [Fact]
    public async Task ResetPasswordAsync_UnknownEmail_ThrowsInvalidOtp()
    {
        await Assert.ThrowsAsync<InvalidOtpException>(() => _service.ResetPasswordAsync(ResetRequest(), "ip"));
    }

    [Fact]
    public async Task ResetPasswordAsync_PasswordsDoNotMatch_DoesNotUseAnAttempt()
    {
        var user = UserWithOtp();

        var ex = await Assert.ThrowsAsync<InvalidCitizenRegistrationRequestException>(
            () => _service.ResetPasswordAsync(ResetRequest(otp: "000000", confirm: "SomethingElse1!"), "ip"));

        Assert.Equal("Passwords do not match.", ex.Message);
        Assert.Equal(0, user.OTPAttemptCount);
    }

    [Fact]
    public async Task ResetPasswordAsync_WeakPassword_DoesNotUseAnAttempt()
    {
        var user = UserWithOtp();

        await Assert.ThrowsAsync<InvalidCitizenRegistrationRequestException>(
            () => _service.ResetPasswordAsync(ResetRequest(otp: "000000", newPassword: "short"), "ip"));

        Assert.Equal(0, user.OTPAttemptCount);
    }
}
