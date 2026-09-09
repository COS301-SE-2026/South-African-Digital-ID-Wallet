using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Auth.DTOs;
using Application.Features.ManageUserAccountCard.DTOs;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;

namespace tests;

public class AuthServiceDeviceTrustTests
{
    private const string CorrectOtp = "123456"; // NOSONAR - test-only dummy credential, not a real secret
    private const string RawDeviceToken = "generated-device-token"; // NOSONAR - test-only dummy credential, not a real secret
    private const string ExistingDeviceToken = "existing-device-token"; // NOSONAR - test-only dummy credential, not a real secret
    private const string TestIpAddress = "192.168.1.10"; // NOSONAR - test-only dummy value, not a real secret

    private static string HashOtp(string otp) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(otp)));

    private sealed class FakeAuthRepository : IAuthRepository
    {
        public User? UserToReturn;
        public Citizen? CitizenToReturn;
        public List<AuditLog> AuditLogs = new();
        public int UserUpdates;
        public int Saves;

        public Task<User?> GetUserByEmailAsync(string email) => Task.FromResult(UserToReturn);
        public Task<User?> GetUserByIdAsync(Guid userId) => Task.FromResult(UserToReturn);
        public Task<Citizen?> GetCitizenByUserIdAsync(Guid userId) => Task.FromResult(CitizenToReturn);

        public Task UpdateUserAsync(User user)
        {
            UserUpdates++;
            return Task.CompletedTask;
        }

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

    private sealed class FakeTrustedDeviceRepository : ITrustedDeviceRepository
    {
        public TrustedDevice? ExistingDevice;
        public DeviceVerification? VerificationToReturn;

        public List<TrustedDevice> Added = new();
        public List<TrustedDevice> Updated = new();
        public List<DeviceVerification> UpdatedVerifications = new();

        public Task<TrustedDevice?> GetByTokenHashAsync(Guid userId, string deviceTokenHash, CancellationToken cancellationToken) =>
            Task.FromResult(ExistingDevice);

        public Task AddTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken)
        {
            Added.Add(trustedDevice);
            return Task.CompletedTask;
        }

        public Task<DeviceVerification?> GetDeviceVerificationAsync(Guid deviceId, CancellationToken cancellationToken) =>
            Task.FromResult(VerificationToReturn);

        public Task UpdateTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken)
        {
            Updated.Add(trustedDevice);
            return Task.CompletedTask;
        }

        public Task AddDeviceVerificationAsync(DeviceVerification deviceVerification, CancellationToken cancellationToken)
        {
            VerificationToReturn = deviceVerification;
            return Task.CompletedTask;
        }

        public Task UpdateDeviceVerificationAsync(DeviceVerification deviceVerification, CancellationToken cancellationToken)
        {
            UpdatedVerifications.Add(deviceVerification);
            return Task.CompletedTask;
        }

        public Task<List<TrustedDevice>> GetTrustedDevicesByUserIdAsync(Guid userId) =>
            Task.FromResult(new List<TrustedDevice>());

        public Task<bool> UnlinkDeviceAsync(Guid userId, Guid deviceId) => Task.FromResult(false);
    }

    private sealed class FakeDeviceTokenProvider : IDeviceTokenProvider
    {
        public int GenerateCalls;

        public string GenerateToken()
        {
            GenerateCalls++;
            return RawDeviceToken;
        }

        public string HashToken(string token) => $"hashed-{token}";
    }

    private sealed class FakeJwtTokenProvider : IJwtTokenProvider
    {
        public bool? LastRememberMe;

        public (string Token, DateTime ExpiresAt) GenerateToken(User user, bool rememberMe = false)
        {
            LastRememberMe = rememberMe;
            return ("fake-token", DateTime.UtcNow.AddHours(8));
        }
    }

    private sealed class FakePasswordHashingProvider : IPasswordHashingProvider
    {
        public string HashPassword(string password) => password;
        public bool VerifyPassword(string password, string storedHash) => password == storedHash;
    }

    private sealed class FakeEmailSenderProvider : IEmailSenderProvider
    {
        public Task SendEmailAsync(string email, string subject, string message, CancellationToken cancellationToken) =>
            Task.CompletedTask;
    }

    private sealed class FakeHostEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Production;
        public string ApplicationName { get; set; } = "tests";
        public string ContentRootPath { get; set; } = Directory.GetCurrentDirectory();
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }

    private sealed class FakeIpGeolocationProvider : IIpGeolocationProvider
    {
        public IpLocationResult? LocationToReturn = new() { City = "Pretoria", Country = "South Africa" };
        public bool ShouldThrow;
        public int Calls;

        public Task<IpLocationResult?> GetLocationAsync(string ipAddress, CancellationToken cancellationToken)
        {
            Calls++;
            if (ShouldThrow) throw new HttpRequestException("Geolocation service unavailable.");
            return Task.FromResult(LocationToReturn);
        }
    }

    private sealed class Ctx
    {
        public FakeAuthRepository Auth = null!;
        public FakeTrustedDeviceRepository Devices = null!;
        public FakeDeviceTokenProvider Tokens = null!;
        public FakeJwtTokenProvider Jwt = null!;
        public FakeIpGeolocationProvider Geo = null!;
        public AuthService Service = null!;
        public User User = null!;
        public DeviceVerification Verification = null!;
    }

    private static Ctx Setup(bool userDeleted = false, User? user = null)
    {
        var subject = user ?? new User
        {
            Id = Guid.NewGuid(),
            Email = "thandiwe@flashid.test",
            PasswordHash = "correct-password", // NOSONAR - test-only dummy credential, not a real secret
            Role = UserRole.Citizen,
            IsEmailVerified = true,
            IsDeleted = userDeleted,
        };

        var verification = new DeviceVerification
        {
            Id = Guid.NewGuid(),
            UserId = subject.Id,
            OtpHash = HashOtp(CorrectOtp),
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            AttemptCount = 0,
            VerifiedAt = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var auth = new FakeAuthRepository { UserToReturn = subject };
        var devices = new FakeTrustedDeviceRepository { VerificationToReturn = verification };
        var tokens = new FakeDeviceTokenProvider();
        var jwt = new FakeJwtTokenProvider();
        var geo = new FakeIpGeolocationProvider();

        var service = new AuthService(
            auth,
            jwt,
            new FakePasswordHashingProvider(),
            null!,
            new AuthMapper(),
            devices,
            tokens,
            new FakeEmailSenderProvider(),
            new FakeHostEnvironment(),
            geo,
            NullLogger<AuthService>.Instance);

        return new Ctx
        {
            Auth = auth,
            Devices = devices,
            Tokens = tokens,
            Jwt = jwt,
            Geo = geo,
            Service = service,
            User = subject,
            Verification = verification,
        };
    }

    private static VerifyDeviceRequestDto Request(
        Guid verificationId,
        string? deviceName = "Thandiwe's Laptop",
        bool rememberMe = false) => new()
        {
            DeviceVerificationId = verificationId,
            Otp = CorrectOtp,
            DeviceType = DeviceType.Desktop,
            OperatingSystem = "Windows 11",
            Browser = "Chrome",
            DeviceName = deviceName,
            RememberMe = rememberMe,
        };

    private static TrustedDevice KnownDevice(Guid userId) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        DeviceTokenHash = $"hashed-{ExistingDeviceToken}",
        DeviceType = DeviceType.Desktop,
        OperatingSystem = "Windows 10",
        Browser = "Firefox",
        DeviceName = "Old Name",
        LastKnownCity = "Cape Town",
        LastKnownCountry = "South Africa",
        LastActive = DateTime.UtcNow.AddDays(-30),
        IsTrusted = false,
        CreatedAt = DateTime.UtcNow.AddDays(-60),
        UpdatedAt = DateTime.UtcNow.AddDays(-30),
    };

    [Fact]
    public async Task VerifyDeviceAsync_WithNoDeviceCookie_TrustsANewDeviceAndReturnsTheRawToken()
    {
        var c = Setup();
        var before = DateTime.UtcNow;

        var result = await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id), null, TestIpAddress, TestContext.Current.CancellationToken);

        var device = Assert.Single(c.Devices.Added);
        Assert.Equal(c.User.Id, device.UserId);
        Assert.Equal($"hashed-{RawDeviceToken}", device.DeviceTokenHash);
        Assert.Equal(DeviceType.Desktop, device.DeviceType);
        Assert.Equal("Windows 11", device.OperatingSystem);
        Assert.Equal("Chrome", device.Browser);
        Assert.Equal("Thandiwe's Laptop", device.DeviceName);
        Assert.True(device.IsTrusted);
        Assert.InRange(device.LastActive, before, DateTime.UtcNow);

        Assert.Equal(RawDeviceToken, result.DeviceToken);
        Assert.False(result.RequiresDeviceVerification);
        Assert.Null(result.DeviceVerificationId);
        Assert.Equal("fake-token", result.Token);
        Assert.Equal(c.User.Id, result.UserId);
        Assert.Equal(nameof(UserRole.Citizen), result.Role);
    }

    [Fact]
    public async Task VerifyDeviceAsync_WithAnExistingDeviceCookie_DoesNotIssueANewToken()
    {
        var c = Setup();

        var result = await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id), ExistingDeviceToken, TestIpAddress, TestContext.Current.CancellationToken);

        Assert.Equal(0, c.Tokens.GenerateCalls);
        Assert.Null(result.DeviceToken);
        var device = Assert.Single(c.Devices.Added);
        Assert.Equal($"hashed-{ExistingDeviceToken}", device.DeviceTokenHash);
    }

    [Fact]
    public async Task VerifyDeviceAsync_StampsTheNewDeviceWithTheResolvedLocation()
    {
        var c = Setup();

        await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id), null, TestIpAddress, TestContext.Current.CancellationToken);

        var device = Assert.Single(c.Devices.Added);
        Assert.Equal("Pretoria", device.LastKnownCity);
        Assert.Equal("South Africa", device.LastKnownCountry);
        Assert.Equal(1, c.Geo.Calls);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task VerifyDeviceAsync_WithNoIpAddress_SkipsGeolocationEntirely(string? ipAddress)
    {
        var c = Setup();

        await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id), null, ipAddress, TestContext.Current.CancellationToken);

        Assert.Equal(0, c.Geo.Calls);
        var device = Assert.Single(c.Devices.Added);
        Assert.Null(device.LastKnownCity);
        Assert.Null(device.LastKnownCountry);
    }

    [Fact]
    public async Task VerifyDeviceAsync_WhenGeolocationFails_StillTrustsTheDevice()
    {
        var c = Setup();
        c.Geo.ShouldThrow = true;

        var result = await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id), null, TestIpAddress, TestContext.Current.CancellationToken);

        var device = Assert.Single(c.Devices.Added);
        Assert.Null(device.LastKnownCity);
        Assert.True(device.IsTrusted);
        Assert.Equal("fake-token", result.Token);
    }

    [Fact]
    public async Task VerifyDeviceAsync_WhenGeolocationReturnsNothing_LeavesLocationBlank()
    {
        var c = Setup();
        c.Geo.LocationToReturn = null;

        await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id), null, TestIpAddress, TestContext.Current.CancellationToken);

        var device = Assert.Single(c.Devices.Added);
        Assert.Null(device.LastKnownCity);
        Assert.Null(device.LastKnownCountry);
    }

    [Fact]
    public async Task VerifyDeviceAsync_WithAPreviouslyKnownDevice_ReTrustsItInsteadOfAddingAnother()
    {
        var c = Setup();
        var known = KnownDevice(c.User.Id);
        c.Devices.ExistingDevice = known;
        var before = DateTime.UtcNow;

        await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id), ExistingDeviceToken, TestIpAddress, TestContext.Current.CancellationToken);

        Assert.Empty(c.Devices.Added);
        Assert.Same(known, Assert.Single(c.Devices.Updated));
        Assert.True(known.IsTrusted);
        Assert.InRange(known.LastActive, before, DateTime.UtcNow);
        Assert.Equal("Pretoria", known.LastKnownCity);
        Assert.Equal("Thandiwe's Laptop", known.DeviceName);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task VerifyDeviceAsync_WithNoIncomingDeviceName_KeepsTheStoredName(string? deviceName)
    {
        var c = Setup();
        var known = KnownDevice(c.User.Id);
        c.Devices.ExistingDevice = known;

        await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id, deviceName), ExistingDeviceToken, TestIpAddress, TestContext.Current.CancellationToken);

        Assert.Equal("Old Name", known.DeviceName);
    }

    [Fact]
    public async Task VerifyDeviceAsync_WhenGeolocationFailsForAKnownDevice_KeepsThePreviousLocation()
    {
        var c = Setup();
        var known = KnownDevice(c.User.Id);
        c.Devices.ExistingDevice = known;
        c.Geo.LocationToReturn = null;

        await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id), ExistingDeviceToken, TestIpAddress, TestContext.Current.CancellationToken);

        Assert.Equal("Cape Town", known.LastKnownCity);
    }

    [Fact]
    public async Task VerifyDeviceAsync_TrimsAndTruncatesAnOverlongDeviceName()
    {
        var c = Setup();
        var longName = "  " + new string('D', 150) + "  ";

        await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id, longName), null, TestIpAddress, TestContext.Current.CancellationToken);

        var device = Assert.Single(c.Devices.Added);
        Assert.Equal(100, device.DeviceName.Length);
        Assert.Equal(new string('D', 100), device.DeviceName);
    }

    [Fact]
    public async Task VerifyDeviceAsync_ConsumesTheVerificationSoItCannotBeReplayed()
    {
        var c = Setup();
        var before = DateTime.UtcNow;

        await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id), null, TestIpAddress, TestContext.Current.CancellationToken);

        Assert.NotNull(c.Verification.VerifiedAt);
        Assert.InRange(c.Verification.VerifiedAt!.Value, before, DateTime.UtcNow);
        Assert.Contains(c.Verification, c.Devices.UpdatedVerifications);
    }

    [Fact]
    public async Task VerifyDeviceAsync_WritesADeviceVerifiedAuditLogAndRecordsTheLogin()
    {
        var c = Setup();
        var before = DateTime.UtcNow;

        await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id), null, TestIpAddress, TestContext.Current.CancellationToken);

        var log = Assert.Single(c.Auth.AuditLogs);
        Assert.Equal(AuditEventType.DeviceVerified, log.EventType);
        Assert.Equal(c.User.Id, log.ActorId);
        Assert.Equal(TestIpAddress, log.IpAddress);
        Assert.Contains(c.User.Email, log.Details);

        Assert.NotNull(c.User.LastLoginAt);
        Assert.InRange(c.User.LastLoginAt!.Value, before, DateTime.UtcNow);
        Assert.Equal(1, c.Auth.UserUpdates);
        Assert.Equal(1, c.Auth.Saves);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task VerifyDeviceAsync_PassesRememberMeThroughToTheTokenProvider(bool rememberMe)
    {
        var c = Setup();

        await c.Service.VerifyDeviceAsync(
            Request(c.Verification.Id, rememberMe: rememberMe), null, TestIpAddress, TestContext.Current.CancellationToken);

        Assert.Equal(rememberMe, c.Jwt.LastRememberMe);
    }

    [Fact]
    public async Task VerifyDeviceAsync_WhenTheUserNoLongerExists_ThrowsAndTrustsNothing()
    {
        var c = Setup();
        c.Auth.UserToReturn = null;

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => c.Service.VerifyDeviceAsync(
                Request(c.Verification.Id), null, TestIpAddress, TestContext.Current.CancellationToken));

        Assert.Empty(c.Devices.Added);
        Assert.Null(c.Verification.VerifiedAt);
    }

    [Fact]
    public async Task VerifyDeviceAsync_WhenTheUserIsDeleted_ThrowsAndTrustsNothing()
    {
        var c = Setup(userDeleted: true);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => c.Service.VerifyDeviceAsync(
                Request(c.Verification.Id), null, TestIpAddress, TestContext.Current.CancellationToken));

        Assert.Empty(c.Devices.Added);
        Assert.Null(c.Verification.VerifiedAt);
    }
}
