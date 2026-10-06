using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.Auth.DTOs;
using Application.Features.ManageUserAccountCard.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace tests;

public class RefreshTokenIntegrationTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough";
    private const string TestPassword = "CitizenPwd123!";
    private const string DeviceToken = "trusted-device-token";
    private const string RefreshCookie = "refresh_token";

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

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
                    ["Jwt:Issuer"] = "FlashId",
                    ["Jwt:Audience"] = "FlashIdWeb",
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
            var db = Services.CreateScope().ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.EnsureCreatedAsync();
            return db;
        }

        public HttpClient CreateApiClient() =>
            CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            if (disposing)
            {
                _connection.Dispose();
            }
        }
    }

    private static async Task<User> SeedTrustedUserAsync(TestApiFactory factory)
    {
        var db = await factory.CreateInitializedContextAsync();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = $"user-{Guid.NewGuid():N}@flashid.test",
            PhoneNumber = "+27821234567",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(TestPassword),
            Role = UserRole.Citizen,
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        await db.DomainUsers.AddAsync(user, Ct);
        await db.TrustedDevices.AddAsync(new TrustedDevice
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            DeviceTokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(DeviceToken))),
            DeviceType = DeviceType.Mobile,
            OperatingSystem = "iOS",
            Browser = "FlashID",
            DeviceName = "Test Phone",
            LastActive = DateTime.UtcNow,
            IsTrusted = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        }, Ct);
        await db.SaveChangesAsync(Ct);
        return user;
    }

    private static HttpClient MobileClient(TestApiFactory factory)
    {
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Add("X-Client", "mobile");
        client.DefaultRequestHeaders.Add("X-Device-Token", DeviceToken);
        return client;
    }

    private static async Task<JsonElement> MobileLoginAsync(TestApiFactory factory, User user)
    {
        var response = await MobileClient(factory).PostAsJsonAsync("/api/auth/login",
            new LoginRequestDto { Email = user.Email, Password = TestPassword, RememberMe = true }, Ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await response.Content.ReadFromJsonAsync<JsonElement>(Ct);
    }

    private static Task<HttpResponseMessage> MobileRefreshAsync(TestApiFactory factory, string refreshToken) =>
        MobileClient(factory).PostAsJsonAsync("/api/auth/refresh", new RefreshTokenRequestDto { RefreshToken = refreshToken }, Ct);

    private static string? SetCookieValue(HttpResponseMessage response, string name)
    {
        if (!response.Headers.TryGetValues("Set-Cookie", out var cookies)) return null;
        var cookie = cookies.FirstOrDefault(c => c.StartsWith($"{name}=", StringComparison.Ordinal));
        return cookie?.Split(';')[0][(name.Length + 1)..];
    }

    private static async Task<HttpStatusCode> MeStatusAsync(TestApiFactory factory, string accessToken)
    {
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return (await client.GetAsync("/api/auth/me", Ct)).StatusCode;
    }

    [Fact]
    public async Task Login_FromMobile_ReturnsARefreshTokenInTheBodyWithoutARefreshCookie()
    {
        using var factory = new TestApiFactory();
        var user = await SeedTrustedUserAsync(factory);

        var response = await MobileClient(factory).PostAsJsonAsync("/api/auth/login",
            new LoginRequestDto { Email = user.Email, Password = TestPassword, RememberMe = true }, Ct);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("refreshToken").GetString()));
        Assert.True(body.GetProperty("refreshTokenExpiresAt").GetDateTime() > DateTime.UtcNow.AddDays(29));
        Assert.True(body.GetProperty("expiresAt").GetDateTime() < DateTime.UtcNow.AddMinutes(16));
        Assert.Null(SetCookieValue(response, RefreshCookie));
    }

    [Fact]
    public async Task Login_FromTheWeb_SetsARefreshCookieAndWithholdsItFromTheBody()
    {
        using var factory = new TestApiFactory();
        var user = await SeedTrustedUserAsync(factory);
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Add("X-Device-Token", DeviceToken);

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequestDto { Email = user.Email, Password = TestPassword }, Ct);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(string.IsNullOrWhiteSpace(SetCookieValue(response, RefreshCookie)));
        Assert.False(body.TryGetProperty("refreshToken", out _));
        Assert.False(body.TryGetProperty("token", out _));
    }

    [Fact]
    public async Task Refresh_FromMobile_RotatesTheRefreshTokenAndReturnsAWorkingAccessToken()
    {
        using var factory = new TestApiFactory();
        var user = await SeedTrustedUserAsync(factory);
        var login = await MobileLoginAsync(factory, user);
        var original = login.GetProperty("refreshToken").GetString()!;

        var response = await MobileRefreshAsync(factory, original);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(original, body.GetProperty("refreshToken").GetString());
        Assert.Equal(user.Id, body.GetProperty("userId").GetGuid());
        Assert.Equal(HttpStatusCode.OK, await MeStatusAsync(factory, body.GetProperty("token").GetString()!));
    }

    [Fact]
    public async Task Refresh_FromTheWeb_ReadsTheCookieAndSetsFreshCookies()
    {
        using var factory = new TestApiFactory();
        var user = await SeedTrustedUserAsync(factory);
        var login = await MobileLoginAsync(factory, user);
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        request.Headers.Add("Cookie", $"{RefreshCookie}={login.GetProperty("refreshToken").GetString()}");

        var response = await factory.CreateApiClient().SendAsync(request, Ct);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(string.IsNullOrWhiteSpace(SetCookieValue(response, "access_token")));
        Assert.False(string.IsNullOrWhiteSpace(SetCookieValue(response, RefreshCookie)));
        Assert.False(string.IsNullOrWhiteSpace(SetCookieValue(response, "csrf_token")));
        Assert.False(body.TryGetProperty("token", out _));
    }

    [Fact]
    public async Task Refresh_WithAnUnknownToken_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();

        var response = await MobileRefreshAsync(factory, "not-a-real-token");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_WithoutAToken_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();

        var response = await factory.CreateApiClient().PostAsync("/api/auth/refresh", null, Ct);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_WithATokenThatWasJustRotated_ReturnsConflictAndKeepsTheSession()
    {
        using var factory = new TestApiFactory();
        var user = await SeedTrustedUserAsync(factory);
        var original = (await MobileLoginAsync(factory, user)).GetProperty("refreshToken").GetString()!;
        var rotated = await (await MobileRefreshAsync(factory, original)).Content.ReadFromJsonAsync<JsonElement>(Ct);

        var raced = await MobileRefreshAsync(factory, original);
        var next = await MobileRefreshAsync(factory, rotated.GetProperty("refreshToken").GetString()!);

        Assert.Equal(HttpStatusCode.Conflict, raced.StatusCode);
        Assert.Equal(HttpStatusCode.OK, next.StatusCode);
    }

    [Fact]
    public async Task Refresh_WithAnOldRotatedToken_RevokesTheWholeSession()
    {
        using var factory = new TestApiFactory();
        var user = await SeedTrustedUserAsync(factory);
        var original = (await MobileLoginAsync(factory, user)).GetProperty("refreshToken").GetString()!;
        var rotated = await (await MobileRefreshAsync(factory, original)).Content.ReadFromJsonAsync<JsonElement>(Ct);
        var db = await factory.CreateInitializedContextAsync();
        var used = await db.RefreshTokens.SingleAsync(t => t.RevokedAt != null, Ct);
        used.RevokedAt = DateTime.UtcNow.AddMinutes(-5);
        await db.SaveChangesAsync(Ct);

        var replayed = await MobileRefreshAsync(factory, original);
        var afterReplay = await MobileRefreshAsync(factory, rotated.GetProperty("refreshToken").GetString()!);

        Assert.Equal(HttpStatusCode.Unauthorized, replayed.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, afterReplay.StatusCode);
    }

    [Fact]
    public async Task Refresh_AfterTheTokenVersionChanges_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        var user = await SeedTrustedUserAsync(factory);
        var refreshToken = (await MobileLoginAsync(factory, user)).GetProperty("refreshToken").GetString()!;
        var db = await factory.CreateInitializedContextAsync();
        var stored = await db.DomainUsers.SingleAsync(u => u.Id == user.Id, Ct);
        stored.TokenVersion++;
        await db.SaveChangesAsync(Ct);

        var response = await MobileRefreshAsync(factory, refreshToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_WithAnExpiredToken_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        var user = await SeedTrustedUserAsync(factory);
        var refreshToken = (await MobileLoginAsync(factory, user)).GetProperty("refreshToken").GetString()!;
        var db = await factory.CreateInitializedContextAsync();
        var stored = await db.RefreshTokens.SingleAsync(Ct);
        stored.ExpiresAt = DateTime.UtcNow.AddMinutes(-1);
        await db.SaveChangesAsync(Ct);

        var response = await MobileRefreshAsync(factory, refreshToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_RevokesOnlyThatSessionsRefreshToken()
    {
        using var factory = new TestApiFactory();
        var user = await SeedTrustedUserAsync(factory);
        var phone = await MobileLoginAsync(factory, user);
        var laptop = await MobileLoginAsync(factory, user);
        var client = MobileClient(factory);
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", laptop.GetProperty("token").GetString());

        var logout = await client.PostAsJsonAsync("/api/auth/logout",
            new RefreshTokenRequestDto { RefreshToken = laptop.GetProperty("refreshToken").GetString() }, Ct);

        Assert.Equal(HttpStatusCode.OK, logout.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await MobileRefreshAsync(factory, laptop.GetProperty("refreshToken").GetString()!)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, await MeStatusAsync(factory, phone.GetProperty("token").GetString()!));
        Assert.Equal(HttpStatusCode.OK,
            (await MobileRefreshAsync(factory, phone.GetProperty("refreshToken").GetString()!)).StatusCode);
    }
}
