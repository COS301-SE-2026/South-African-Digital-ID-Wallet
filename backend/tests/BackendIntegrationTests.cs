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
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin@12345"),
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
        var password = "secret@1234";
        var user = CreateCitizenUser(email, password);

        context.DomainUsers.Add(user);
        await context.SaveChangesAsync();

        var result = await service.LoginAsync(
            new LoginRequestDto
            {
                Email = email,
                Password = password,
            },
            "127.0.0.1"
        );

        var storedUser = await context.DomainUsers.FirstAsync(u => u.Id == user.Id);
        var auditLog = await context.AuditLogs.SingleAsync();

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
        Assert.Equal("127.0.0.1", auditLog.IpAddress);
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_IncrementsFailuresAndCreatesAuditLog()
    {
        using var context = CreateContext();
        var service = CreateAuthService(context);
        var email = "tiana.rogers@example.com";
        var user = CreateCitizenUser(email, "secret@1234");

        context.DomainUsers.Add(user);
        await context.SaveChangesAsync();

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.LoginAsync(new LoginRequestDto { Email = email, Password = "wrong" }, "10.0.0.1")
        );

        var storedUser = await context.DomainUsers.FirstAsync(u => u.Id == user.Id);
        var auditLog = await context.AuditLogs.SingleAsync();

        Assert.Equal(1, storedUser.FailedLoginAttempts);
        Assert.Equal(AuditEventType.FailedLoginAttempt, auditLog.EventType);
        Assert.Equal("10.0.0.1", auditLog.IpAddress);
    }
}