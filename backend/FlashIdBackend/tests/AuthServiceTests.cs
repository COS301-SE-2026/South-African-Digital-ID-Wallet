using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Auth.DTOs;
using Application.Features.ManageUserAccountCard.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Providers;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
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

    private class FakeHostEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Development;

        public string ApplicationName { get; set; } = "tests";

        public string ContentRootPath { get; set; } = Directory.GetCurrentDirectory();

        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }

    private class IpGeolocationProvider : IIpGeolocationProvider
    {
        public Task<IpLocationResult?> GetLocationAsync(string ipAddress,
            CancellationToken cancellationToken)
        {
            return Task.FromResult<IpLocationResult?>(new IpLocationResult
            {
                City = "Play",
                Country = "Played"
            });
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

    private static TrustedDevice ValidTrustedDevice(Guid userId)
    {
        return new TrustedDevice
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DeviceTokenHash = "hashed-trusted-browser-token",
            DeviceType = DeviceType.Desktop,
            OperatingSystem = "Windows 11",
            Browser = "Chrome",
            LastActive = DateTime.UtcNow.AddDays(-1),
            IsTrusted = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
    }

    private static DeviceVerification ValidDeviceVerification(Guid userId)
    {
        return new DeviceVerification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OtpHash = "stored-otp-hash",
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            AttemptCount = 0,
            VerifiedAt = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
    }

    private static AuthService CreateAuthService(FakeAuthRepository fakeAuthRepository, FakeJwtTokenProvider fakeJwtTokenProvider, FakeTrustedDeviceRepository fakeTrustedDeviceRepository)
    {
        var fakePasswordHasher = new FakePasswordHashingProvider();
        var fakeHostEnvironment = new FakeHostEnvironment();
        var fakeEmailSenderProvider = new FakeEmailSenderProvider();
        var fakeDeviceTokenProvider = new FakeDeviceTokenProvider();
        var mapper = new AuthMapper();
        var fakeIpGeolocationProvider = new IpGeolocationProvider();
        return new AuthService(fakeAuthRepository, fakeJwtTokenProvider, fakePasswordHasher, null!, mapper, fakeTrustedDeviceRepository, fakeDeviceTokenProvider, fakeEmailSenderProvider, fakeHostEnvironment, fakeIpGeolocationProvider);
    }

    [Fact]
    public async Task LoginAsync_RememberMeTrue_GeneratesLongerExpiry()
    {
        var user = ValidUser();
        var fakeRepository = new FakeAuthRepository { UserToReturn = user };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository { TrustedDeviceToReturn = ValidTrustedDevice(user.Id) };
        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);

        var request = new LoginRequestDto
        {
            Email = user.Email,
            Password = "correct-password",
            RememberMe = true,
        };

        var result = await authService.LoginAsync(request, "trusted-browser-token", "127.0.0.1", CancellationToken.None);

        Assert.True(fakeJwtProvider.LastRememberMeValue);
        Assert.False(result.RequiresDeviceVerification);
        Assert.Equal("fake-token", result.Token);
        Assert.True(result.ExpiresAt > DateTime.UtcNow.AddDays(29));
    }

    [Fact]
    public async Task LoginAsync_RememberMeFalse_GeneratesShorterExpiry()
    {
        var user = ValidUser();
        var fakeRepository = new FakeAuthRepository { UserToReturn = user };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository { TrustedDeviceToReturn = ValidTrustedDevice(user.Id) };

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);

        var request = new LoginRequestDto
        {
            Email = user.Email,
            Password = "correct-password",
            RememberMe = false,
        };

        var result = await authService.LoginAsync(request, "trusted-browser-token", "127.0.0.1", CancellationToken.None);
        Assert.Equal(false, fakeJwtProvider.LastRememberMeValue);
        Assert.False(result.RequiresDeviceVerification);
        Assert.Equal("fake-token", result.Token);
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

        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository();

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);

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
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository();

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);

        var result = await authService.GetCurrentUserAsync(Guid.NewGuid());
        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_NewDevice_ReturnsRequiresDeviceVerification()
    {
        var user = ValidUser();

        var fakeRepository = new FakeAuthRepository
        {
            UserToReturn = user,
        };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository { TrustedDeviceToReturn = null };

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);

        var request = new LoginRequestDto
        {
            Email = user.Email,
            Password = "correct-password",
            RememberMe = false,
        };

        var result = await authService.LoginAsync(request, "null", "127.0.0.1", CancellationToken.None);

        Assert.True(result.RequiresDeviceVerification);
        Assert.NotNull(result.DeviceVerificationId);
        Assert.NotEqual(Guid.Empty, result.DeviceVerificationId);
        Assert.True(string.IsNullOrEmpty(result.Token));
        Assert.NotNull(fakeTrustedDeviceRepository.VerificationToReturn);
        Assert.Equal(user.Id, fakeTrustedDeviceRepository.VerificationToReturn!.UserId);
        Assert.Equal(result.DeviceVerificationId, fakeTrustedDeviceRepository.VerificationToReturn.Id);
    }

    [Fact]
    public async Task VerifyDeviceAsync_EmptyVerificationId_ThrowsUnauthorizedAccessException()
    {

        var fakeRepository = new FakeAuthRepository();
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository();

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);
        var request = new VerifyDeviceRequestDto
        {
            DeviceVerificationId = Guid.Empty,
            Otp = "123456",
            DeviceType = DeviceType.Laptop,
            OperatingSystem = "Windows",
            Browser = "Chrome"
        };

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.VerifyDeviceAsync(request, null, "127.0.0.1", CancellationToken.None));

        Assert.Equal("Device verification ID is required.", exception.Message);
    }

    [Fact]
    public async Task VerifyDeviceAsync_MisingOtp_ThrowsUnauthorizedAccessException()
    {
        var fakeRepository = new FakeAuthRepository();
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository();

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);
        var request = new VerifyDeviceRequestDto
        {
            DeviceVerificationId = Guid.NewGuid(),
            Otp = "",
            DeviceType = DeviceType.Laptop,
            OperatingSystem = "Windows",
            Browser = "Chrome"
        };

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.VerifyDeviceAsync(request, null, "127.0.0.1", CancellationToken.None));

        Assert.Equal("Verification OTP is required.", exception.Message);

    }

    [Fact]
    public async Task VerifyDeviceAsync_VerificationNotFound_ThrowsUnauthorizedAccessException()
    {
        var fakeRepository = new FakeAuthRepository();
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository { VerificationToReturn = null };

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);
        var request = new VerifyDeviceRequestDto
        {
            DeviceVerificationId = Guid.NewGuid(),
            Otp = "123456",
            DeviceType = DeviceType.Laptop,
            OperatingSystem = "Windows",
            Browser = "Chrome"
        };

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.VerifyDeviceAsync(request, null, "127.0.0.1", CancellationToken.None));

        Assert.Equal("Device verification request not found.", exception.Message);
    }

    [Fact]
    public async Task VerifyDeviceAsync_AlreadyVerified_ThrowsUnauthorizedAccessException()
    {
        var user = ValidUser();
        var verification = ValidDeviceVerification(user.Id);

        verification.VerifiedAt = DateTime.UtcNow;

        var fakeRepository = new FakeAuthRepository { UserToReturn = user };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository { VerificationToReturn = verification };

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);
        var request = new VerifyDeviceRequestDto
        {
            DeviceVerificationId = verification.Id,
            Otp = "123456",
            DeviceType = DeviceType.Laptop,
            OperatingSystem = "Windows",
            Browser = "Chrome"
        };

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.VerifyDeviceAsync(request, null, "127.0.0.1", CancellationToken.None));

        Assert.Equal("Device verification has already been used.", exception.Message);
    }

    [Fact]
    public async Task VerifyDeviceAsync_ExpiredVerification_ThrowsUnauthorizedAccessException()
    {
        var user = ValidUser();
        var verification = ValidDeviceVerification(user.Id);

        verification.ExpiresAt = DateTime.UtcNow.AddMinutes(-1);

        var fakeRepository = new FakeAuthRepository { UserToReturn = user };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository { VerificationToReturn = verification };

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);
        var request = new VerifyDeviceRequestDto
        {
            DeviceVerificationId = verification.Id,
            Otp = "123456",
            DeviceType = DeviceType.Laptop,
            OperatingSystem = "Windows",
            Browser = "Chrome"
        };

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.VerifyDeviceAsync(request, null, "127.0.0.1", CancellationToken.None));

        Assert.Equal("Device verification code has expired.", exception.Message);
    }

    [Fact]
    public async Task VerifyDeviceAsync_MaxAttemptsReached_ThrowsUnauthorizedAccessException()
    {
        var user = ValidUser();
        var verification = ValidDeviceVerification(user.Id);

        verification.AttemptCount = 5;

        var fakeRepository = new FakeAuthRepository { UserToReturn = user };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository { VerificationToReturn = verification };

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);
        var request = new VerifyDeviceRequestDto
        {
            DeviceVerificationId = verification.Id,
            Otp = "123456",
            DeviceType = DeviceType.Laptop,
            OperatingSystem = "Windows",
            Browser = "Chrome"
        };

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.VerifyDeviceAsync(request, null, "127.0.0.1", CancellationToken.None));

        Assert.Equal("Too many verification attempts. Please log in again.", exception.Message);
    }

    [Fact]
    public async Task VerifyDeviceAsync_InvalidOtp_IncrementsAttemptCount_AddThrowsUnauthorizedAccessException()
    {
        var user = ValidUser();
        var verification = ValidDeviceVerification(user.Id);

        verification.OtpHash = "incorrect-stored-hash";

        var fakeRepository = new FakeAuthRepository { UserToReturn = user };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository { VerificationToReturn = verification };

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);
        var request = new VerifyDeviceRequestDto
        {
            DeviceVerificationId = verification.Id,
            Otp = "123456",
            DeviceType = DeviceType.Laptop,
            OperatingSystem = "Windows",
            Browser = "Chrome"
        };

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.VerifyDeviceAsync(request, null, "127.0.0.1", CancellationToken.None));

        Assert.Equal("Invalid device verification code.", exception.Message);
        Assert.Equal(1, verification.AttemptCount);
        Assert.Equal(verification, fakeTrustedDeviceRepository.VerificationToReturn);
    }

    [Fact]
    public async Task ResendDeviceVerificationOtpAsync_VerificationNotFound_ThrowsUnauthorizedAccessException()
    {
        var deviceVerificationId = Guid.NewGuid();
        var fakeRepository = new FakeAuthRepository();
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository { VerificationToReturn = null };
        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.ResendDeviceVerificationOtpAsync(deviceVerificationId, "127.0.0.1", CancellationToken.None));
        Assert.Equal("Device verification request not found.", exception.Message);

    }

    [Fact]
    public async Task ResendDeviceVerificationOtpAsync_AlreadyCompleted_ThrowsUnauthorizedAccessException()
    {
        var user = ValidUser();
        var verification = ValidDeviceVerification(user.Id);
        verification.VerifiedAt = DateTime.UtcNow;
        var fakeRepository = new FakeAuthRepository { UserToReturn = user };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository { VerificationToReturn = verification };

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.ResendDeviceVerificationOtpAsync(verification.Id, "127.0.0.1", CancellationToken.None));
        Assert.Equal("Device verification has already been completed.", exception.Message);
    }

    [Fact]
    public async Task ResendDeviceVerificationOtpAsync_ExpiredVerification_ThrowsUnauthorizedAccessException()
    {
        var user = ValidUser();
        var verification = ValidDeviceVerification(user.Id);
        verification.ExpiresAt = DateTime.UtcNow.AddMinutes(-1);
        var fakeRepository = new FakeAuthRepository { UserToReturn = user };
        var fakeJwtProvider = new FakeJwtTokenProvider();
        var fakeTrustedDeviceRepository = new FakeTrustedDeviceRepository { VerificationToReturn = verification };

        var authService = CreateAuthService(fakeRepository, fakeJwtProvider, fakeTrustedDeviceRepository);
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.ResendDeviceVerificationOtpAsync(verification.Id, "127.0.0.1", CancellationToken.None));
        Assert.Equal("Device verification code has expired. Please resend the code.", exception.Message);
    }


}