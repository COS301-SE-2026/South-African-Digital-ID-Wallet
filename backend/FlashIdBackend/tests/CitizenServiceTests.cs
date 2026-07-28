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
    private const string ValidPassword = "Str0ng!Passw0rd";

    private sealed class FakeCitizenRepo : ICitizenRepository
    {
        public bool EmailTaken;
        public User? UserByEmail;
        public List<User> AddedUsers = new();
        public List<AuditLog> AuditLogs = new();
        public int Saves;

        public Task<bool> IsEmailTakenAsync(string email, Guid excludeUserId) => Task.FromResult(EmailTaken);
        public Task<User?> GetUserByEmailAsync(string email) => Task.FromResult(UserByEmail);
        public Task AddUserAync(User user) { AddedUsers.Add(user); return Task.CompletedTask; }
        public Task UpdateUserAsync(User user) => Task.CompletedTask;
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
        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default) { SendCount++; LastToEmail = toEmail; return Task.CompletedTask; }
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

    private static User UserWithOtp(string otp = "123456", int expiryMinutes = 10, bool verified = false, int attempts = 0)
    {
        var user = new User { Id = Guid.NewGuid(), Email = TestEmail, IsEmailVerified = verified };
        user.SetOtp($"h:{otp}", expiryMinutes);
        for (var i = 0; i < attempts; i++)
        {
            user.IncrementOtpAttempt();
        }
        return user;
    }

    private static RegisterCitizenRequestDto RegisterRequest(string password = ValidPassword) => new() { Email = TestEmail, Password = password };
}