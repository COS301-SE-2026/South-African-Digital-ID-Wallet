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
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@12345"),
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
}