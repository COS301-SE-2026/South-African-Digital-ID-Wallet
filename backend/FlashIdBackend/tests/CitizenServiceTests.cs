using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class CitizenServiceTests
{
    private const string TestEmail = "thabo.mokoena@example.com";
    private const string TestPassword = "Str0ng!Passw0rd";
    private const string TestOtp = "123456";

    private sealed class FakeCitizenRepo : ICitizenRepository
    {
        public bool EmailTaken;
        public User? UserByEmail;
        public List<User> AddedUsers = new();
        public List<AuditLog> AuditLogs = new();
        public int Saves;
        public int Updates;

        public Task<bool> IsEmailTakenAsync(string email, Guid excludeUserId) => Task.FromResult(EmailTaken);
        public Task<User?> GetUserByEmailAsync(string email) => Task.FromResult(UserByEmail);
        public Task AddUserAync(User user) { AddedUsers.Add(user); return Task.CompletedTask; }
        public Task UpdateUserAsync(User user) { Updates++; return Task.CompletedTask; }
        public Task AddAuditLogAsync(AuditLog log) { AuditLogs.Add(log); return Task.CompletedTask; }
        public Task SaveChangesAsync() { Saves++; return Task.CompletedTask; }
    }

    private sealed class FakeHasher : IPasswordHashingProvider
    {
        public string HashPassword(string password) => $"h:{password}";
        public bool VerifyPassword(string password, string storedHash) => storedHash == $"h:{password}";
    }

    private sealed class FakeEmailSender : IEmailSenderProvider
    {
        public int SendCount;
        public string? LastToEmail;
        public string? LastSubject;
        public string? LastMessage;
        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default) { SendCount++; LastToEmail = toEmail; LastSubject = subject; LastMessage = message; return Task.CompletedTask; }
    }

    private sealed class Ctx
    {
        public FakeCitizenRepo Repo = null!;
        public FakeEmailSender Email = null!;
        public CitizenService Service = null!;
    }

    private static Ctx Setup(bool emailTaken = false, User? existingUser = null)
    {
        var repo = new FakeCitizenRepo { EmailTaken = emailTaken, UserByEmail = existingUser };
        var email = new FakeEmailSender();
        return new Ctx
        {
            Repo = repo,
            Email = email,
            Service = new CitizenService(repo, new FakeHasher(), email, new CitizenMapper()),
        };
    }

    private static User UserWithOtp(string? otp = "123456", int expiryMinutes = 10, bool verified = false, int attempts = 0)
    {
        var user = new User { Id = Guid.NewGuid(), Email = TestEmail, IsEmailVerified = verified };
        if (otp is not null)
        {
            user.SetOtp($"h:{otp}", expiryMinutes);
        }
        for (var i = 0; i < attempts; i++)
        {
            user.IncrementOtpAttempt();
        }
        return user;
    }

    private static RegisterCitizenRequestDto RegisterRequest(string password = TestPassword) => new() { Email = TestEmail, Password = password };

    [Fact]
    public async Task Register_ValidRequest_CreatesUserWritesAuditAndSendOtp()
    {
        var c = Setup();
        var response = await c.Service.RegisterCitizenAsync(new RegisterCitizenRequestDto { Email = TestEmail, Password = TestPassword });
        var user = Assert.Single(c.Repo.AddedUsers);
        Assert.Equal(TestEmail, user.Email);
        Assert.Equal($"h:{TestPassword}", user.PasswordHash);
        Assert.True(user.PasswordSet);
        Assert.False(user.IsEmailVerified);
        Assert.Equal(UserRole.Citizen, user.Role);
        Assert.Matches(@"^h:\d{6}$", user.EmailOTPHash!);
        var audit = Assert.Single(c.Repo.AuditLogs);
        Assert.Equal(AuditEventType.UserRegistered, audit.EventType);
        Assert.Equal(user.Id, audit.ActorId);
        Assert.Equal("system", audit.IpAddress);
        Assert.Equal(1, c.Repo.Saves);
        Assert.Equal(1, c.Email.SendCount);
        Assert.Equal(TestEmail, c.Email.LastToEmail);
        Assert.Equal("Your FlashID verification code", c.Email.LastSubject);
        Assert.Contains(user.EmailOTPHash![2..], c.Email.LastMessage!);
        Assert.Equal(user.Id, response.UserId);
        Assert.Equal(TestEmail, response.Email);
        Assert.Contains("Account created successfully", response.Message);
    }

    [Fact]
    public async Task Register_EmailAlreadyTaken_Throws()
    {
        var c = Setup(emailTaken: true);
        await Assert.ThrowsAsync<EmailTakenException>(() => c.Service.RegisterCitizenAsync(RegisterRequest()));
        Assert.Empty(c.Repo.AddedUsers);
        Assert.Equal(0, c.Email.SendCount);
    }

    [Fact]
    public async Task Register_InvalidRequest_ThrowsBeforeTouchingRepository()
    {
        var c = Setup();
        await Assert.ThrowsAsync<InvalidCitizenRegistrationRequestException>(() => c.Service.RegisterCitizenAsync(RegisterRequest(password: "weak")));
        Assert.Empty(c.Repo.AddedUsers);
        Assert.Equal(0, c.Repo.Saves);
    }

    [Fact]
    public async Task VerifyEmail_UnknownEmail_ThrowsInvalidOtp()
    {
        var c = Setup(existingUser: null);
        await Assert.ThrowsAsync<InvalidOtpException>(() => c.Service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = TestEmail, OTP = TestOtp }));
    }

    [Fact]
    public async Task VerifyEmail_AlreadyVerified_Throws()
    {
        var c = Setup(existingUser: UserWithOtp(verified: true));
        await Assert.ThrowsAsync<EmailAlreadyVerifiedException>(() => c.Service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = TestEmail, OTP = TestOtp }));
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task VerifyEmail_MissingOrExpiredOtp_Throws(bool noOtp)
    {
        var user = noOtp ? UserWithOtp(otp: null) : UserWithOtp(expiryMinutes: -1);
        var c = Setup(existingUser: user);
        await Assert.ThrowsAsync<OtpExpiredException>(() => c.Service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = TestEmail, OTP = TestOtp }));
    }

    [Fact]
    public async Task VerifyEmail_TooManyAttempts_Throws()
    {
        var c = Setup(existingUser: UserWithOtp(attempts: 5));
        await Assert.ThrowsAsync<TooManyOtpAttemptsException>(() => c.Service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = TestEmail, OTP = "999999" }));
    }

    [Fact]
    public async Task VerifyEmail_WrongOtp_IncrementsAttemptAndThrows()
    {
        var user = UserWithOtp();
        var c = Setup(existingUser: user);
        await Assert.ThrowsAsync<InvalidOtpException>(() => c.Service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = TestEmail, OTP = "999999" }));
        Assert.Equal(1, user.OTPAttemptCount);
        Assert.False(user.IsEmailVerified);
        Assert.Equal(1, c.Repo.Updates);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Fact]
    public async Task VerifyEmail_CorrectOtp_MarksVerifiedAndClearsOtp()
    {
        var user = UserWithOtp();
        var c = Setup(existingUser: user);
        await c.Service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = TestEmail, OTP = TestOtp });
        Assert.True(user.IsEmailVerified);
        Assert.Null(user.EmailOTPHash);
        Assert.Equal(0, user.OTPAttemptCount);
        Assert.Equal(1, c.Repo.Updates);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Fact]
    public async Task ResendOtp_UnknownEmail_Throws()
    {
        var c = Setup(existingUser: null);
        await Assert.ThrowsAsync<InvalidCitizenRegistrationRequestException>(() => c.Service.ResendOtpAsync(new ResendOtpRequestDto { Email = TestEmail }));
    }

    [Fact]
    public async Task ResendOtp_AlreadyVerified_Throws()
    {
        var c = Setup(existingUser: UserWithOtp(verified: true));
        await Assert.ThrowsAsync<EmailAlreadyVerifiedException>(() => c.Service.ResendOtpAsync(new ResendOtpRequestDto { Email = TestEmail }));
        Assert.Equal(0, c.Email.SendCount);
    }

    [Fact]
    public async Task ResentOtp_ValidUser_IssuesNewOtpAndSendsEmail()
    {
        var user = UserWithOtp(attempts: 3);
        var c = Setup(existingUser: user);
        await c.Service.ResendOtpAsync(new ResendOtpRequestDto { Email = TestEmail });
        Assert.Matches(@"^h:\d{6}$", user.EmailOTPHash!);
        Assert.Equal(0, user.OTPAttemptCount);
        Assert.Equal(1, c.Repo.Updates);
        Assert.Equal(1, c.Repo.Saves);
        Assert.Equal(1, c.Email.SendCount);
        Assert.Contains(user.EmailOTPHash![2..], c.Email.LastMessage!);
    }
}