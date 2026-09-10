using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.ManageUserAccountCard.DTOs;
using Application.Features.UpdatePassword.DTOs;
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

public class UpdatePasswordControllerIntegrationTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR - not a real secret
    private const string JwtIssuer = "FlashId";
    private const string JwtAudience = "FlashIdWeb";

    private const string CurrentPassword = "CurrentPwd123!"; // NOSONAR - not a real secret
    private const string NewPassword = "BrandNewPwd456!"; // NOSONAR - not a real secret
    private const string WrongPassword = "InvalidPwd123!"; // NOSONAR - not a real secret

    private const string Endpoint = "/api/UpdatePassword";

    private sealed class StubEmailSenderProvider : IEmailSenderProvider
    {
        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default) =>
            Task.CompletedTask;
    }

    private sealed class StubIpGeolocationProvider : IIpGeolocationProvider
    {
        public Task<IpLocationResult?> GetLocationAsync(string ipAddress, CancellationToken cancellationToken) =>
        Task.FromResult<IpLocationResult?>(null);
    }

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

                services.RemoveAll(typeof(IEmailSenderProvider));
                services.AddScoped<IEmailSenderProvider, StubEmailSenderProvider>();

                services.RemoveAll(typeof(IIpGeolocationProvider));
                services.AddScoped<IIpGeolocationProvider, StubIpGeolocationProvider>();

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

        public HttpClient CreateApiClient() =>
            CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            if (disposing) _connection.Dispose();
        }
    }

    private static string GenerateTokenFor(User user)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = JwtKey,
            ["Jwt:Issuer"] = JwtIssuer,
            ["Jwt:Audience"] = JwtAudience,
        }).Build();

        return new JwtTokenProvider(config).GenerateToken(user).Token;
    }

    private static async Task<User> SeedUserAsync(TestApiFactory factory, UserRole role = UserRole.Citizen)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = $"user-{Guid.NewGuid():N}@flashid.test",
            PhoneNumber = "+27821234567",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(CurrentPassword), // NOSONAR - not a real secret
            Role = role,
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var db = await factory.CreateInitializedContextAsync();
        await db.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);
        return user;
    }

    private static HttpClient ClientFor(TestApiFactory factory, User user)
    {
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(user));
        return client;
    }

    private static UpdatePasswordDto Dto(
        string current = CurrentPassword,
        string next = NewPassword,
        string? confirm = null) => new()
        {
            CurrentPassword = current,
            NewPassword = next,
            ConfirmPassword = confirm ?? next,
        };

    private static async Task<string> StoredHashAsync(TestApiFactory factory, Guid userId)
    {
        var db = await factory.CreateInitializedContextAsync();
        var user = await db.DomainUsers.FirstAsync(u => u.Id == userId, TestContext.Current.CancellationToken);
        return user.PasswordHash;
    }

    [Fact]
    public async Task UpdatePassword_WithoutAuthentication_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();
        var client = factory.CreateApiClient();

        var response = await client.PutAsJsonAsync(Endpoint, Dto(), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdatePassword_WithCorrectCurrentPassword_PersistsANewBcryptHash()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var originalHash = await StoredHashAsync(factory, user.Id);
        var client = ClientFor(factory, user);

        var response = await client.PutAsJsonAsync(Endpoint, Dto(), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updatedHash = await StoredHashAsync(factory, user.Id);
        Assert.NotEqual(originalHash, updatedHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(NewPassword, updatedHash));
        Assert.False(BCrypt.Net.BCrypt.Verify(CurrentPassword, updatedHash));
    }

    [Fact]
    public async Task UpdatePassword_WithTheWrongCurrentPassword_ReturnsBadRequestAndKeepsTheOldHash()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var originalHash = await StoredHashAsync(factory, user.Id);
        var client = ClientFor(factory, user);

        var response = await client.PutAsJsonAsync(
            Endpoint, Dto(current: WrongPassword), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(originalHash, await StoredHashAsync(factory, user.Id));
    }

    [Fact]
    public async Task UpdatePassword_WhenConfirmationDoesNotMatch_ReturnsBadRequestAndKeepsTheOldHash()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var originalHash = await StoredHashAsync(factory, user.Id);
        var client = ClientFor(factory, user);

        var response = await client.PutAsJsonAsync(
            Endpoint, Dto(confirm: "SomethingElse789!"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(originalHash, await StoredHashAsync(factory, user.Id));
    }

    [Theory]
    [InlineData(UserRole.Citizen)]
    [InlineData(UserRole.Official)]
    [InlineData(UserRole.GovernmentAdministrator)]
    public async Task UpdatePassword_IsAvailableToEveryAuthenticatedRole(UserRole role)
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory, role);
        var client = ClientFor(factory, user);

        var response = await client.PutAsJsonAsync(Endpoint, Dto(), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
