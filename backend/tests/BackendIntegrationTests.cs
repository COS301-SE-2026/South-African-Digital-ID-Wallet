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


}