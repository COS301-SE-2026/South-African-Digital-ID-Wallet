using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Providers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace tests;

public class InstitutionsControllerTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR
    private const string JwtIssuer = "FlashId";
    private const string JwtAudience = "FlashIdWeb";

    private sealed class TestApiFactory : WebApplicationFactory<Program>
    {
        private readonly SqliteConnection _connection = new("DataSource=:memory:");

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = JwtKey,
                    ["Jwt:Issuer"] = JwtIssuer,
                    ["Jwt:Audience"] = JwtAudience,
                });
            });

            builder.ConfigureServices(services =>
            {
                _connection.Open();
                services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));
                services.RemoveAll(typeof(IHostedService));
            });
        }

        public async Task<AppDbContext> CreateInitializedContextAsync()
        {
            var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.EnsureCreatedAsync();
            return db;
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            if (disposing)
            {
                _connection.Dispose();
            }
        }
    }

    private static string GenerateTokenFor(User user)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = JwtKey,
            ["Jwt:Issuer"] = JwtIssuer,
            ["Jwt:Audience"] = JwtAudience,
        })
        .Build();

        return new JwtTokenProvider(config).GenerateToken(user).Token;
    }

    private static User BuildUser(UserRole role) => new()
    {
        Id = Guid.NewGuid(),
        Email = $"{role}.{Guid.NewGuid():N}@flashid.local",
        PhoneNumber = "0820000000",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), // NOSONAR  test data
        PasswordSet = true,
        IsDeleted = false,
        IsEmailVerified = true,
        Role = role,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
    };

    private static async Task<(User User, GovernmentAdministrator Admin)> SeedGovernmentAdministratorAsync(AppDbContext db, CancellationToken ct)
    {
        var user = BuildUser(UserRole.GovernmentAdministrator);
        var admin = new GovernmentAdministrator
        {
            Id = Guid.NewGuid(),
            GovernmentId = "GOV-ADM-NFR55",
            Names = "Anele",
            Surname = "Dlamini",
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.DomainUsers.Add(user);
        db.GovernmentAdministrators.Add(admin);
        await db.SaveChangesAsync(ct);
        return (user, admin);
    }

    [Fact]
    public async Task RegisterInstitution_ForEveryInstitutionType_OnboardsThroughTheApiWithoutCodeChanges()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var ct = TestContext.Current.CancellationToken;
        var (user, admin) = await SeedGovernmentAdministratorAsync(db, ct);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(user));

        var institutionTypes = Enum.GetValues<InstitutionType>();
        foreach (var type in institutionTypes)
        {
            var name = $"NFR5.5 {type} Office";
            var register = await client.PostAsJsonAsync("/api/institutions/register", new
            {
                name,
                type = (int)type,
                verificationNumber = $"NFR55-{type}",
                adminId = admin.Id,
            }, ct);
            var registerBody = await register.Content.ReadAsStringAsync(ct);
            Assert.True(
                register.StatusCode == HttpStatusCode.Created,
                $"Registering a {type} institution returned {(int)register.StatusCode}: {registerBody}");

            using var created = JsonDocument.Parse(registerBody);
            var institutionId = created.RootElement.GetProperty("institutionId").GetGuid();
            Assert.False(string.IsNullOrEmpty(created.RootElement.GetProperty("apiKey").GetString()));

            var fetch = await client.GetAsync($"/api/institutions/{institutionId}", ct);
            Assert.Equal(HttpStatusCode.OK, fetch.StatusCode);
            using var fetched = JsonDocument.Parse(await fetch.Content.ReadAsStringAsync(ct));
            Assert.Equal(name, fetched.RootElement.GetProperty("name").GetString());
        }

        var all = await client.GetFromJsonAsync<JsonElement>("/api/institutions", ct);
        Assert.Equal(institutionTypes.Length, all.GetArrayLength());
    }

    [Fact]
    public async Task RegisterInstitution_AsCitizen_ReturnsForbidden()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var ct = TestContext.Current.CancellationToken;
        var citizen = BuildUser(UserRole.Citizen);
        db.DomainUsers.Add(citizen);
        await db.SaveChangesAsync(ct);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(citizen));

        var response = await client.PostAsJsonAsync("/api/institutions/register", new
        {
            name = "Should Not Exist",
            type = 0,
            verificationNumber = "NFR55-FORBIDDEN",
            adminId = Guid.NewGuid(),
        }, ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}