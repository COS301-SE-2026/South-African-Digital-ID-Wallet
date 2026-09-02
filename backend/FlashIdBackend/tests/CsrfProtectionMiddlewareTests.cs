using System.Net;
using System.Net.Http.Headers;
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

public class CsrfProtectionMiddlewareTests
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

        var provider = new JwtTokenProvider(config);

        return provider.GenerateToken(user).Token;
    }

    private static User BuildUser(UserRole role) => new()
    {
        Id = Guid.NewGuid(),
        Email = $"{role}.{Guid.NewGuid():N}@flashid.local",
        PhoneNumber = "0820000000",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), // NOSONAR
        PasswordSet = true,
        IsDeleted = false,
        IsEmailVerified = true,
        Role = role,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
    };

    [Fact]
    public async Task PostRequest_WithAccessTokenCookieButNoCsrfToken_ReturnsForbidden()
    {
        await using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();

        var client = factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
        request.Headers.Add("Cookie", "access_token=some-token-value");

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task PostRequest_WithMismatchedCsrfTokens_ReturnsForbidden()
    {
        await using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();

        var client = factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
        request.Headers.Add("Cookie", "access_token=some-token-value; csrf_token=correct-token");
        request.Headers.Add("X-CSRF-Token", "wrong-token");

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task PostRequest_WithMatchingCsrfTokenAndValidAuth_DoesNotReturnForbidden()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();

        var user = BuildUser(UserRole.Citizen);
        await db.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(user));
        request.Headers.Add("Cookie", "access_token=some-token-value; csrf_token=matching-token");
        request.Headers.Add("X-CSRF-Token", "matching-token");

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }
}