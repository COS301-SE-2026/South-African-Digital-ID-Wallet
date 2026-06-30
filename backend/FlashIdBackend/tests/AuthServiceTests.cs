using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Auth.DTOs;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class AuthServiceTests
{
    private class FakeAuthRepository : IAuthRepository
    {
        public User? UserToReturn { get; set; }

        public Task<User?> GetUserByEmailAsync(string email) => Task.FromResult(UserToReturn);

        public Task<User?> GetUserByIdAsync(Guid userId) => Task.FromResult(UserToReturn);

        public Task UpdateUserAsync(User user) => Task.CompletedTask;

        public Task AddAuditLogAsync(AuditLog auditLog) => Task.CompletedTask;

        public Task SaveChangesAsync() => Task.CompletedTask;
    }

    private class FakePasswordHashingProvider : IPasswordHashingProvider
    {
        public string HashPassword(string password) => password;

        public bool VerifyPassword(string password, string storedHash) => password == storedHash;
    }

    private class FakeJwtTokenProvider : IJwtTokenProvider
    {
        public bool? LastRememberMeValue { get; private set; }

        public (string Token, DateTime ExpiresAt) GenerateToken(User user, bool rememberMe = false)
        {
            LastRememberMeValue = rememberMe;
            var expiresAt = rememberMe ? DateTime.UtcNow.AddDays(30) : DateTime.UtcNow.AddHours(8);
            return ("fake-token", expiresAt);
        }
    }

    private static User ValidUser() => new()
    {
        Id = Guid.NewGuid(),
        Names = "Jacob",
        Surname = "Kruger",
        Email = "jacob.kruger1@flashid.local",
        Username = "JacobK1",
        PasswordHash = "correct-password",
        Role = UserRole.GovernmentAdministrator,
        IsDeleted = false,
    };

    [Fact]
    public async Task LoginAsync_RememberMeTrue_GeneratesLongerExpiry()
    {
        var fakeRepository = new FakeAuthRepository { UserToReturn = ValidUser() };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakePasswordHasher = new FakePasswordHashingProvider();
        var mapper = new AuthMapper();
        var authService = new AuthService(fakeRepository, fakeJwtProvider, fakePasswordHasher, mapper);

        var request = new LoginRequestDto
        {
            Email = "jacob.kruger1@flashid.local",
            Password = "correct-password",
            RememberMe = true,
        };

        var result = await authService.LoginAsync(request, "127.0.0.1");

        Assert.True(fakeJwtProvider.LastRememberMeValue);
        Assert.True(result.ExpiresAt > DateTime.UtcNow.AddDays(29));
    }

    [Fact]
    public async Task LoginAsync_RememberMeFalse_GeneratesShorterExpiry()
    {
        var fakeRepository = new FakeAuthRepository { UserToReturn = ValidUser() };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakePasswordHasher = new FakePasswordHashingProvider();
        var mapper = new AuthMapper();
        var authService = new AuthService(fakeRepository, fakeJwtProvider, fakePasswordHasher, mapper);

        var request = new LoginRequestDto
        {
            Email = "jacob.kruger1@flashid.local",
            Password = "correct-password",
            RememberMe = false,
        };

        var result = await authService.LoginAsync(request, "127.0.0.1");

        Assert.False(fakeJwtProvider.LastRememberMeValue);
        Assert.True(result.ExpiresAt < DateTime.UtcNow.AddDays(1));
    }
}