using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;
using Domain.Entities;

namespace tests;

public class CitizenServiceTests
{
    private class SampleCitizenRepository : ICitizenRepository
    {
        public bool EmailTaken { get; set; }
        public User? UserToReturn { get; set; }
        public bool AddUserCalled { get; private set; }
        public bool AddAuditLogCalled { get; private set; }
        public bool UpdateUserCalled { get; private set; }
        public bool SaveChangesCalled { get; private set; }
        public User? LastAddedUser { get; private set; }
        public User? LastUpdatedUser { get; private set; }
        public AuditLog? LastAuditLog { get; private set; }

        public Task<bool> IsEmailTakenAsync(string email, Guid excludeUserId) => Task.FromResult(EmailTaken);
        public Task<User?> GetUserByEmailAsync(string email) => Task.FromResult(UserToReturn);

        public Task AddUserAsync(User user)
        {
            AddUserCalled = true;
            LastAddedUser = user;
            return Task.CompletedTask;
        }

        public Task UpdateUserAsync(User user)
        {
            UpdateUserCalled = true;
            LastUpdatedUser = user;
            return Task.CompletedTask;
        }

        public Task AddAuditLogAsync(AuditLog auditLog)
        {
            AddAuditLogCalled = true;
            LastAuditLog = auditLog;
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync()
        {
            SaveChangesCalled = true;
            return Task.CompletedTask;
        }
    }

    private class SamplePasswordHashingProvider : IPasswordHashingProvider
    {
        public string HashPassword(string password) => password;
        public bool VerifyPassword(string password, string storedHash) => password == storedHash;
    }

    private class SampleEmailSenderProvider : IEmailSenderProvider
    {
        public int SendCount { get; private set; }
        public string? LastToEmail { get; private set; }
        public string? LastSubject { get; private set; }

        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default)
        {
            SendCount++;
            LastToEmail = toEmail;
            LastSubject = subject;
            return Task.CompletedTask;
        }
    }

    private static RegisterCitizenRequestDto ValidRegisterRequest() => new()
    {
        Email = "random@citizen.com",
        Password = "P@ssword123" // NOSONAR
    };

    private static User UnverifiedUser(string otp = "654321")
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "random@citizen.com",
            IsEmailVerified = false
        };

        user.SetOtp(otp);
        return user;
    }

    private static CitizenService CreateService(
        SampleCitizenRepository repo,
        SamplePasswordHashingProvider? hasher = null,
        SampleEmailSenderProvider? emailSender = null) => new(
            repo, hasher ?? new SamplePasswordHashingProvider(),
            emailSender ?? new SampleEmailSenderProvider(),
            new CitizenMapper()
    );

    [Fact]
    public async Task RegisterCitizenAsync_ValidRequest_ReturnResAndPersistsUser()
    {
        var repo = new SampleCitizenRepository { EmailTaken = false };
        var emailSender = new SampleEmailSenderProvider();
        var service = CreateService(repo, emailSender: emailSender);
        var res = await service.RegisterCitizenAsync(ValidRegisterRequest());

        Assert.Equal("random@citizen.com", res.Email);
        Assert.NotEqual(Guid.Empty, res.UserId);
        Assert.Equal("Account created successfully. Please check your email to verify your account.", res.Message);
        Assert.True(repo.AddUserCalled);
        Assert.True(repo.AddAuditLogCalled);
        Assert.True(repo.SaveChangesCalled);
        Assert.Equal(1, emailSender.SendCount);
        Assert.Equal("random@citizen.com", emailSender.LastToEmail);
    }

    [Fact]
    public async Task RegisterCitizenAsync_EmailAlreadyTaken_ThrowsEmailTakenException()
    {
        var repo = new SampleCitizenRepository { EmailTaken = true };
        var service = CreateService(repo);

        await Assert.ThrowsAsync<EmailTakenException>(() => service.RegisterCitizenAsync(ValidRegisterRequest()));
        Assert.False(repo.AddUserCalled);
    }

    [Fact]
    public async Task RegisterCitizenAsync_InvalidRequest_ThrowsBeforeTouchingRepository()
    {
        var repo = new SampleCitizenRepository();
        var service = CreateService(repo);
        var req = new RegisterCitizenRequestDto { Email = "invalid-email", Password = "invalid-password" };

        await Assert.ThrowsAsync<InvalidCitizenRegistrationRequestException>(() => service.RegisterCitizenAsync(req));
        Assert.False(repo.AddUserCalled);
    }

    [Fact]
    public async Task VerifyEmailAsync_UserNotFound_ThrowsInvalidOtpException()
    {
        var repo = new SampleCitizenRepository { UserToReturn = null };
        var service = CreateService(repo);

        await Assert.ThrowsAsync<InvalidOtpException>(() => service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = "random@citizen.com", OTP = "654321" }));
    }

    [Fact]
    public async Task VerifyEmailAsync_AlreadyVerified_ThrowsEmailAlreadyVerifiedException()
    {
        var user = UnverifiedUser();
        user.MarkEmailVerified();
        var repo = new SampleCitizenRepository { UserToReturn = user };
        var service = CreateService(repo);

        await Assert.ThrowsAsync<EmailAlreadyVerifiedException>(() => service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = user.Email, OTP = "654321" }));
    }

    [Fact]
    public async Task VerifyEmailAsync_NoOtpSet_ThrowsOtpExpiredException()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "random@citizen.com"
        };
        var repo = new SampleCitizenRepository { UserToReturn = user };
        var service = CreateService(repo);

        await Assert.ThrowsAsync<OtpExpiredException>(() => service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = user.Email, OTP = "654321" }));
    }

    [Fact]
    public async Task VerifyEmailAsync_TooManyAttempts_ThrowsTooManyOtpAttemptsException()
    {
        var user = UnverifiedUser();
        for (var i = 0; i < 5; i++) user.IncrementOtpAttempt();
        var repo = new SampleCitizenRepository { UserToReturn = user };
        var service = CreateService(repo);

        await Assert.ThrowsAsync<TooManyOtpAttemptsException>(() => service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = user.Email, OTP = "654321" }));
    }

    [Fact]
    public async Task VerifyEmailAsync_WrongOtp_IncrementsAttemptCountAndThrowsInvalidOtpException()
    {
        var user = UnverifiedUser("654321");
        var repo = new SampleCitizenRepository { UserToReturn = user };
        var service = CreateService(repo);

        await Assert.ThrowsAsync<InvalidOtpException>(() => service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = user.Email, OTP = "123456" }));
        Assert.Equal(1, user.OTPAttemptCount);
        Assert.True(repo.UpdateUserCalled);
        Assert.True(repo.SaveChangesCalled);
    }

    [Fact]
    public async Task VerifyEmailAsync_CorrectOtp_MarksEmailVerifiedClearsOtp()
    {
        var user = UnverifiedUser("654321");
        var repo = new SampleCitizenRepository { UserToReturn = user };
        var emailSender = new SampleEmailSenderProvider();
        var service = CreateService(repo, emailSender: emailSender);
        await service.VerifyEmailAsync(new VerifyEmailRequestDto { Email = user.Email, OTP = "654321" });

        Assert.True(user.IsEmailVerified);
        Assert.Null(user.EmailOTPHash);
        Assert.True(repo.UpdateUserCalled);
        Assert.True(repo.SaveChangesCalled);
    }

    [Fact]
    public async Task ResendOtpAsync_UserNotFound_ThrowsInvalidCitizenRegistrationRequestException()
    {
        var repo = new SampleCitizenRepository { UserToReturn = null };
        var service = CreateService(repo);

        var res = await Assert.ThrowsAsync<InvalidCitizenRegistrationRequestException>(() => service.ResendOtpAsync(new ResendOtpRequestDto { Email = "missing-email" }));
        Assert.Contains("No account found", res.Message);
    }

    [Fact]
    public async Task ResendOtpAsync_AlreadyVerified_ThrowsEmailAlreadyVerifiedException()
    {
        var user = UnverifiedUser();
        user.MarkEmailVerified();
        var repo = new SampleCitizenRepository { UserToReturn = user };
        var service = CreateService(repo);

        await Assert.ThrowsAsync<EmailAlreadyVerifiedException>(() => service.ResendOtpAsync(new ResendOtpRequestDto { Email = user.Email }));
    }

    [Fact]
    public async Task ResendOtpAsync_ValidRequest_SetsNewOtpAndSendsEmail()
    {
        var user = UnverifiedUser("654321");
        var repo = new SampleCitizenRepository { UserToReturn = user };
        var emailSender = new SampleEmailSenderProvider();
        var service = CreateService(repo, emailSender: emailSender);

        await service.ResendOtpAsync(new ResendOtpRequestDto { Email = user.Email });
        Assert.True(repo.UpdateUserCalled);
        Assert.True(repo.SaveChangesCalled);
        Assert.Equal(1, emailSender.SendCount);
        Assert.NotNull(user.EmailOTPHash);
    }
}