using Application.Features.Auth.DTOs;
using Application.Features.Institutions.DTOs;
using Application.Common.Mapping;
using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Providers;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace tests;

public class BackendIntegrationTests
{
    private const string LocalhostIp = "127.0.0.1";
    private const string SecondaryTestIp = "10.0.0.1";

    private const string CitizenTestPassword = "secret@1234";
    private const string AdminTestPassword = "admin@12345";
    private const string WrongTestPassword = "wrong";

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
                    ["Jwt:Key"] = "integration-test-secret-key-which-is-long-enough",
                    ["Jwt:Issuer"] = "FlashId",
                    ["Jwt:Audience"] = "FlashIdWeb",
                }
            )
            .Build();
    }

    private static AuthService CreateAuthService(AppDbContext context)
    {
        return new AuthService(
            new AuthRepository(context),
            new JwtTokenProvider(CreateJwtConfiguration()),
            new PasswordHashingProvider(),
            new AuthMapper()
        );
    }

    private static InstitutionService CreateInstitutionService(AppDbContext context)
    {
        return new InstitutionService(new InstitutionRepository(context), new InstitutionMapper());
    }

    private static User CreateCitizenUser(string email, string password)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Names = "Tiana",
            Surname = "Rogers",
            Email = email,
            PhoneNumber = "0813456789",
            Username = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FailedLoginAttempts = 0,
            IsDeleted = false,
            IsEmailVerified = true,
            Role = UserRole.Citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
    }

    private static (User User, GovernmentAdministrator Admin) CreateGovernmentAdmin()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Names = "Anele",
            Surname = "Dlamini",
            Email = "anele.dlamini@flashid.gov.za",
            PhoneNumber = "0820000000",
            Username = "anele.dlamini@flashid.gov.za",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminTestPassword),
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

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await service.LoginAsync(
            new LoginRequestDto
            {
                Email = email,
                Password = password,
            },
            LocalhostIp
        );

        var storedUser = await context.DomainUsers.FirstAsync(u => u.Id == user.Id, TestContext.Current.CancellationToken);
        var auditLog = await context.AuditLogs.SingleAsync(TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.NotEmpty(result.Token);
        Assert.Equal(user.Id, result.UserId);
        Assert.Equal("Citizen", result.Role);
        Assert.Equal("Tiana", result.Names);
        Assert.Equal("Rogers", result.Surname);
        Assert.True(result.ExpiresAt > DateTime.UtcNow);
        Assert.Equal(0, storedUser.FailedLoginAttempts);
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
            () => service.LoginAsync(new LoginRequestDto { Email = email, Password = WrongTestPassword }, SecondaryTestIp)
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