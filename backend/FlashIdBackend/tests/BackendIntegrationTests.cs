using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.Auth.DTOs;
using Application.Features.Citizens.DTOs;
using Application.Features.Institutions.DTOs;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Providers;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace tests;

public class BackendIntegrationTests
{
    private const string LocalhostIp = "127.0.0.1";
    private const string SecondaryTestIp = "203.0.113.1"; // TEST-NET-3 (RFC 5737), reserved for documentation/testing use only

    private const string CitizenTestPassword = "CitizenPwd123!"; // NOSONAR - test-only dummy credential, not a real secret
    private const string AdminTestPassword = "AdminPwd123!"; // NOSONAR - test-only dummy credential, not a real secret
    private const string WrongTestPassword = "InvalidPwd123!"; // NOSONAR - test-only dummy credential, not a real secret
    private const string RawDeviceToken = "integration-test-device-token";// NOSONAR - test-only dummy credential, not a real secret
    private const string HashedDeviceToken = "hashed-integration-test-device-token";// NOSONAR - test-only dummy credential, not a real secret


    private sealed class StubCitizenService : ICitizenService
    {
        public Task<RegisterCitizenResponseDto> RegisterCitizenAsync(RegisterCitizenRequestDto request) =>
            throw new NotImplementedException("Citizen Registration is not apart of these integration tests.");

        public Task VerifyEmailAsync(VerifyEmailRequestDto request) => Task.CompletedTask;

        public Task ResendOtpAsync(ResendOtpRequestDto request) => Task.CompletedTask;
    }

    private sealed class StubEmailSenderProvider : IEmailSenderProvider
    {
        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default) =>
            Task.CompletedTask;
    }

    private sealed class StubApiKeyRevealTokenProvider : IApiKeyRevealTokenProvider
    {
        public string Protect(Guid tokenId, Guid institutionId, string apiKey, TimeSpan lifetime) =>
            $"{tokenId}|{institutionId}|{apiKey}";

        public ApiKeyRevealPayload? Unprotect(string token)
        {
            var parts = token.Split('|', 3);
            if (parts.Length != 3) return null;
            if (!Guid.TryParse(parts[0], out var tokenId) || !Guid.TryParse(parts[1], out var institutionId))
                return null;

            return new ApiKeyRevealPayload(tokenId, institutionId, parts[2]);
        }
    }

    private static IConfiguration CreateInstitutionsConfiguration()
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Institutions:FrontendBaseUrl"] = "http://localhost:3000",
                }
            )
            .Build();
    }

    private sealed class FakeDeviceTokenProvider : IDeviceTokenProvider
    {
        public string GenerateToken()
        {
            return RawDeviceToken;
        }

        public string HashToken(string token)
        {
            return token == RawDeviceToken ? HashedDeviceToken : $"hashed-{token}";
        }
    }

    private sealed class FakeEmailSenderProvide : IEmailSenderProvider
    {
        public Task SendEmailAsync(string email, string subject, string message, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    public sealed class FakeHostEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Development;

        public string ApplicationName { get; set; } = "tests";

        public string ContentRootPath { get; set; } = Directory.GetCurrentDirectory();

        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();

    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static IConfiguration CreateJwtConfiguration()
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = "integration-test-secret-key-which-is-long-enough", // NOSONAR - test-only dummy key, not a real secret
                    ["Jwt:Issuer"] = "FlashId",
                    ["Jwt:Audience"] = "FlashIdWeb",
                }
            )
            .Build();
    }

    private static AuthService CreateAuthService(AppDbContext context)
    {
        var authRepository = new AuthRepository(context);
        var configuration = CreateJwtConfiguration();
        var jwtProvider = new JwtTokenProvider(configuration);
        var passwordHashingProvider = new PasswordHashingProvider();
        var citizenService = new StubCitizenService();
        var mapper = new AuthMapper();
        var trustedDevicesRepository = new TrustedDeviceRepository(context);
        var deviceTokenProvider = new FakeDeviceTokenProvider();
        var emailSenderProvider = new FakeEmailSenderProvide();
        var environment = new FakeHostEnvironment();

        return new AuthService(
            authRepository,
            jwtProvider,
            passwordHashingProvider,
            citizenService,
            mapper,
            trustedDevicesRepository,
            deviceTokenProvider, emailSenderProvider, environment);
    }

    private static InstitutionService CreateInstitutionService(AppDbContext context)
    {
        return new InstitutionService(new InstitutionRepository(context), new InstitutionMapper(), new StubEmailSenderProvider(), new StubApiKeyRevealTokenProvider(), CreateInstitutionsConfiguration());
    }

    private static User CreateCitizenUser(string email, string password)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PhoneNumber = "0813456789",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            PasswordSet = true,
            FailedLoginAttempts = 0,
            IsDeleted = false,
            IsEmailVerified = true,
            Role = UserRole.Citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
    }

    private static TrustedDevice CreateTrustedDevice(Guid userId, string deviceTokenHash = HashedDeviceToken)
    {
        return new TrustedDevice
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DeviceTokenHash = deviceTokenHash,
            DeviceType = Enum.Parse<DeviceType>("Laptop"),
            OperatingSystem = "Windows 11",
            Browser = "Chrome",
            LastKnownCity = "Pretoria",
            LastKnownCountry = "South Africa",
            LastActive = DateTime.UtcNow.AddDays(-1),
            IsTrusted = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }


    private static (User User, GovernmentAdministrator Admin) CreateGovernmentAdmin()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "anele.dlamini@flashid.gov.za",
            PhoneNumber = "0820000000",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminTestPassword),
            PasswordSet = true,
            FailedLoginAttempts = 0,
            IsDeleted = false,
            IsEmailVerified = true,
            Role = UserRole.GovernmentAdministrator,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var admin = new GovernmentAdministrator
        {
            Id = Guid.NewGuid(),
            GovernmentId = "GOV-ADM-001",
            Names = "Anele",
            Surname = "Dlamini",
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        return (user, admin);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsTokenAndCreatesAuditLog()
    {
        using var context = CreateContext();
        var service = CreateAuthService(context);
        var email = "tiana.rogers@example.com";
        var password = CitizenTestPassword;
        var user = CreateCitizenUser(email, password);
        var trustedDevice = CreateTrustedDevice(user.Id);

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await context.TrustedDevices.AddAsync(trustedDevice, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var previousActive = trustedDevice.LastActive;

        var result = await service.LoginAsync(
            new LoginRequestDto
            {
                Email = email,
                Password = password,
                RememberMe = false,
            },
            RawDeviceToken,
            LocalhostIp,
            TestContext.Current.CancellationToken
        );

        var storedUser = await context.DomainUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        var storedDevice = await context.TrustedDevices.FirstAsync(d => d.Id == trustedDevice.Id, TestContext.Current.CancellationToken);
        var auditLog = await context.AuditLogs.SingleAsync(TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.False(result.RequiresDeviceVerification);
        Assert.NotEmpty(result.Token);
        Assert.Equal(user.Id, result.UserId);
        Assert.Equal(UserRole.Citizen.ToString(), result.Role);
        Assert.True(result.ExpiresAt > DateTime.UtcNow);
        Assert.Equal(0, storedUser.FailedLoginAttempts);
        Assert.True(storedDevice.LastActive > previousActive);
        Assert.NotNull(storedUser.LastLoginAt);
        Assert.Equal(AuditEventType.UserLoggedIn, auditLog.EventType);
        Assert.Equal(LocalhostIp, auditLog.IpAddress);
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_IncrementsFailuresAndCreatesAuditLog()
    {
        using var context = CreateContext();
        var service = CreateAuthService(context);
        var email = "tiana.rogers@example.com";
        var user = CreateCitizenUser(email, CitizenTestPassword);

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.LoginAsync(new LoginRequestDto { Email = email, Password = WrongTestPassword, RememberMe = true }, RawDeviceToken,
                SecondaryTestIp,
                TestContext.Current.CancellationToken)
        );

        var storedUser = await context.DomainUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        var auditLog = await context.AuditLogs.SingleAsync(TestContext.Current.CancellationToken);

        Assert.Equal(1, storedUser.FailedLoginAttempts);
        Assert.Equal(AuditEventType.FailedLoginAttempt, auditLog.EventType);
        Assert.Equal(SecondaryTestIp, auditLog.IpAddress);
    }

    [Fact]
    public async Task LogoutAsync_WritesLogoutAuditLog()
    {
        using var context = CreateContext();
        var service = CreateAuthService(context);
        var user = CreateCitizenUser("tiana.rogers@example.com", CitizenTestPassword);

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await service.LogoutAsync(user.Id, LocalhostIp);
        var auditLog = await context.AuditLogs.SingleAsync(TestContext.Current.CancellationToken);

        Assert.Equal("Logged out successfully.", result.Message);
        Assert.Equal(AuditEventType.UserLoggedOut, auditLog.EventType);
        Assert.Equal(user.Id, auditLog.ActorId);
        Assert.Equal(LocalhostIp, auditLog.IpAddress);
    }

    [Fact]
    public async Task RegisterInstitutionAsync_PersistsInstitutionAndAuditLog()
    {
        using var context = CreateContext();
        var service = CreateInstitutionService(context);
        var (adminUser, admin) = CreateGovernmentAdmin();

        await context.DomainUsers.AddAsync(adminUser, TestContext.Current.CancellationToken);
        await context.GovernmentAdministrators.AddAsync(admin, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new RegisterInstitutionRequestDto
        {
            Name = "Home Affairs Johannesburg",
            Type = InstitutionType.HomeAffairs,
            VerificationNumber = "HA-JHB-2026-001",
            AdminId = admin.Id,
            ContactEmail = "contact@homeaffairs-jhb.gov.za",
        };

        var result = await service.RegisterInstitutionAsync(request);

        var institution = await context.Institutions.SingleAsync(TestContext.Current.CancellationToken);
        var auditLog = await context.AuditLogs.SingleAsync(TestContext.Current.CancellationToken);

        Assert.Equal(institution.Id, result.InstitutionId);
        Assert.Equal("Home Affairs Johannesburg", result.Name);
        Assert.Equal("HomeAffairs", result.Type);
        Assert.NotEmpty(result.ApiKey);
        Assert.StartsWith("flashid_live_", result.ApiKey);
        Assert.NotEqual(Guid.Empty, result.ApiKeyReference);
        Assert.Equal("HA-JHB-2026-001", result.VerificationNumber);
        Assert.Equal(AuditEventType.InstitutionRegistered, auditLog.EventType);
        Assert.Equal(admin.UserId, auditLog.ActorId);
    }

    [Fact]
    public async Task GetInstitutionByIdAsync_ReturnsSeededInstitution()
    {
        using var context = CreateContext();
        var service = CreateInstitutionService(context);
        var (adminUser, admin) = CreateGovernmentAdmin();
        var institutionId = Guid.NewGuid();

        await context.DomainUsers.AddAsync(adminUser, TestContext.Current.CancellationToken);
        await context.GovernmentAdministrators.AddAsync(admin, TestContext.Current.CancellationToken);
        await context.Institutions.AddAsync(
            new Institution
            {
                Id = institutionId,
                Name = "Licensing Department Cape Town",
                Type = InstitutionType.LicensingDepartment,
                VerificationNumber = "LD-CT-2026-009",
                ApiKeyReference = Guid.NewGuid(),
                RegisteredById = admin.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            },
            TestContext.Current.CancellationToken
        );
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await service.GetInstitutionByIdAsync(institutionId);

        Assert.Equal(institutionId, result.InstitutionId);
        Assert.Equal("Licensing Department Cape Town", result.Name);
        Assert.Equal("LicensingDepartment", result.Type);
        Assert.Equal("LD-CT-2026-009", result.VerificationNumber);
        Assert.Equal(admin.Id, result.RegisteredById);
    }
}
