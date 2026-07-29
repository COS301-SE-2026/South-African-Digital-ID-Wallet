using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Auth.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Providers;
using Org.BouncyCastle.Bcpg;

namespace tests;

public class AuthServiceTests
{
    private class FakeAuthRepository : IAuthRepository
    {
        public User? UserToReturn { get; set; }
        public Citizen? CitizenToReturn { get; set; }
        public Task<User?> GetUserByEmailAsync(string email) => Task.FromResult(UserToReturn);
        public Task<User?> GetUserByIdAsync(Guid userId) => Task.FromResult(UserToReturn);
        public Task<Citizen?> GetCitizenByUserIdAsync(Guid userId) => Task.FromResult(CitizenToReturn);
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

    private class FakeDeviceTokenProvider : IDeviceTokenProvider
    {
        public string GenerateToken()
        {
            return "trusted-browser-token";
        }

        public string HashToken(string token)
        {
            return token == "trusted-browser-token" ? "hashed-trusted-browser-token" : $"hashed-{token}";
        }
    }

    private class FakeTrustedDeviceRepository : ITrustedDeviceRepository
    {
        public TrustedDevice? TrustedDeviceToReturn { get; set; }
        public DeviceVerification? VerificationToReturn { get; set; }

        public Task<TrustedDevice?> GetByTokenHashAsync(Guid userId, string deviceTokenHash, CancellationToken cancellationToken)
        {
            if (TrustedDeviceToReturn is null) return Task.FromResult<TrustedDevice?>(null);

            var matches = TrustedDeviceToReturn.UserId == userId &&
                          TrustedDeviceToReturn.DeviceTokenHash == deviceTokenHash
                          && TrustedDeviceToReturn.IsTrusted;
            return Task.FromResult(matches ? TrustedDeviceToReturn : null);
        }

        public Task AddTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken)
        {
            TrustedDeviceToReturn = trustedDevice;
            return Task.CompletedTask;
        }

        public Task<DeviceVerification?> GetDeviceVerificationAsync(Guid deviceId, CancellationToken cancellationToken)
        {
            return Task.FromResult(VerificationToReturn);
        }

        public Task UpdateTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken)
        {
            TrustedDeviceToReturn = trustedDevice;
            return Task.CompletedTask;
        }

        public Task AddDeviceVerificationAsync(DeviceVerification deviceVerification, CancellationToken cancellationToken)
        {
            VerificationToReturn = deviceVerification;
            return Task.CompletedTask;
        }

        public Task UpdateDeviceVerificationAsync(DeviceVerification deviceVerification,
            CancellationToken cancellationToken)
        {
            VerificationToReturn = deviceVerification;
            return Task.CompletedTask;
        }

        public Task<List<TrustedDevice>> GetTrustedDevicesByUserIdAsync(Guid userId)
        {
            var devices = TrustedDeviceToReturn is not null && TrustedDeviceToReturn.UserId == userId ? new List<TrustedDevice> { TrustedDeviceToReturn } :
            [];
            return Task.FromResult(devices);
        }

        public Task<bool> UnlinkDeviceAsync(Guid userId, Guid deviceId)
        {
            if (TrustedDeviceToReturn is null || TrustedDeviceToReturn.UserId != userId || TrustedDeviceToReturn.Id != deviceId) return Task.FromResult(false);
            TrustedDeviceToReturn.IsTrusted = false;
            return Task.FromResult(true);
        }
    }

    private class FakeEmailSenderProvider : IEmailSenderProvider
    {
        public Task SendEmailAsync(string email, string subject, string message, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    private static User ValidUser() => new()
    {
        Id = Guid.NewGuid(),
        Email = "jacob.kruger1@flashid.local",
        PasswordHash = "correct-password",
        Role = UserRole.GovernmentAdministrator,
        IsDeleted = false,
        IsEmailVerified = true,
    };

    [Fact]
    public async Task LoginAsync_RememberMeTrue_GeneratesLongerExpiry()
    {
        var fakeRepository = new FakeAuthRepository { UserToReturn = ValidUser() };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakePasswordHasher = new FakePasswordHashingProvider();
        var mapper = new AuthMapper();
        var authService = new AuthService(fakeRepository, fakeJwtProvider, fakePasswordHasher, null!, mapper);

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
        var authService = new AuthService(fakeRepository, fakeJwtProvider, fakePasswordHasher, null!, mapper);

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

    [Fact]
    public async Task GetCurrentUserAsync_ReturnsMappedUserProfile()
    {
        var user = ValidUser();
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Names = "Jacob",
            Surname = "Kruger",
            SaId = "1234567890123",
        };
        var fakeRepository = new FakeAuthRepository
        {
            UserToReturn = user,
            CitizenToReturn = citizen,
        };

        var authService = new AuthService(
            fakeRepository,
            new FakeJwtTokenProvider(),
            new FakePasswordHashingProvider(),
            null!,
            new AuthMapper());

        var result = await authService.GetCurrentUserAsync(user.Id);
        Assert.NotNull(result);
        Assert.Equal(user.Id, result!.UserId);
        Assert.Equal(user.Email, result.Email);
        Assert.Equal(user.Role.ToString(), result.Role);
        Assert.Equal(citizen.Names, result.Names);
        Assert.Equal(citizen.Surname, result.Surname);
        Assert.Equal(citizen.SaId, result.SaId);
    }

    [Fact]
    public async Task GetCurrentUserAsync_ReturnsNull_WhenUserDoesNotExist()
    {
        var fakeRepository = new FakeAuthRepository
        {
            UserToReturn = null,
        };
        var authService = new AuthService(
            fakeRepository,
            new FakeJwtTokenProvider(),
            new FakePasswordHashingProvider(),
            null!,
            new AuthMapper());

        var result = await authService.GetCurrentUserAsync(Guid.NewGuid());
        Assert.Null(result);
    }
}