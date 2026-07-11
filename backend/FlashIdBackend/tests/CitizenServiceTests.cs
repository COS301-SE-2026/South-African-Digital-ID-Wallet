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
}