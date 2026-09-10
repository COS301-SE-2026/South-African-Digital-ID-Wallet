using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.ManageUserAccountCard.DTOs;
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

public class TrustedDevicesControllerIntegrationTests
{

    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR - test-only dummy key, not a real secret
    private const string JwtIssuer = "FlashId";
    private const string JwtAudience = "FlashIdWeb";

    private const string CurrentDeviceToken = "this-browser-token"; // NOSONAR - not a real secret
    private const string OtherDeviceToken = "other-browser-token"; // NOSONAR - not a real secret

    private static string Sha256Hex(string value) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

    private sealed class StubEmailSenderProvider : IEmailSenderProvider
    {
        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class StubIpGeolocationProvider : IIpGeolocationProvider
    {
        public Task<IpLocationResult?> GetLocationAsync(string ipAddress, CancellationToken cancellationToken) => Task.FromResult<IpLocationResult?>(null);
    }

    private sealed class TestApiFactory : WebApplicationFactory<Program>
    {
        private readonly SqliteConnection _connection = new("DataSource= :memory:");

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
                services.RemoveAll(typeof(IEmailSenderProvider)); services.AddScoped<IEmailSenderProvider, StubEmailSenderProvider>();
                services.RemoveAll(typeof(IIpGeolocationProvider)); services.AddScoped<IIpGeolocationProvider, StubIpGeolocationProvider>();
                services.RemoveAll(typeof(IHostedService));
            });
        }

        public async Task<AppDbContext> CreateInitializedContextAsync()
        {
            var scope = Services.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>(); await db.Database.EnsureCreatedAsync(); return db;
        }

        public HttpClient CreateApiClient() => CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing); if (disposing) _connection.Dispose();
        }
    }

    private sealed class Seeded
    {
        public User CitizenUser = null!;
        public User OtherCitizenUser = null!;
        public TrustedDevice CurrentDevice = null!;
        public TrustedDevice NamelessDevice = null!;
        public TrustedDevice ForeignDevice = null!;
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

    private static User BuildUser(UserRole role) => new()
    {
        Id = Guid.NewGuid(),
        Email = $"user-{Guid.NewGuid():N}@flashid.test",
        PhoneNumber = "+27821234567",
        PasswordHash = "hash", //  NOSONAR - not a real secret
        Role = role,
        IsEmailVerified = true,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
    };

    private static TrustedDevice BuildDevice(
        Guid userId,
        string tokenHash,
        string deviceName,
        string browser = "Chrome",
        string operatingSystem = "Windows 11",
        bool isTrusted = true) => new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DeviceTokenHash = tokenHash,
            DeviceType = DeviceType.Desktop,
            OperatingSystem = operatingSystem,
            Browser = browser,
            DeviceName = deviceName,
            LastKnownCity = "Pretoria",
            LastKnownCountry = "South Africa",
            LastActive = DateTime.UtcNow.AddHours(-2),
            IsTrusted = isTrusted,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            UpdatedAt = DateTime.UtcNow.AddHours(-2),
        };

    private static async Task<Seeded> SeedAsync(TestApiFactory factory)
    {

        var db = await factory.CreateInitializedContextAsync();
        var ct = TestContext.Current.CancellationToken;

        var citizenUser = BuildUser(UserRole.Citizen);
        var otherCitizenUser = BuildUser(UserRole.Citizen);

        var currentDevice = BuildDevice(citizenUser.Id, Sha256Hex(CurrentDeviceToken), "Thandiwe's Laptop");
        var namelessDevice = BuildDevice(citizenUser.Id, Sha256Hex(OtherDeviceToken), string.Empty, "Safari", "macOS 15");
        var foreignDevice = BuildDevice(otherCitizenUser.Id, Sha256Hex("someone-elses-token"), "Someone Else's Phone");

        await db.DomainUsers.AddRangeAsync(new[] { citizenUser, otherCitizenUser }, ct);
        await db.TrustedDevices.AddRangeAsync(new[] { currentDevice, namelessDevice, foreignDevice }, ct);
        await db.SaveChangesAsync(ct);

        return new Seeded { CitizenUser = citizenUser, OtherCitizenUser = otherCitizenUser, CurrentDevice = currentDevice, NamelessDevice = namelessDevice, ForeignDevice = foreignDevice, };
    }

    private static HttpClient ClientFor(TestApiFactory factory, User user)
    {
        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(user));

        return client;
    }

    private static async Task<List<JsonElement>> ReadDevicesAsync(HttpResponseMessage response)
    {
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);

        return body.EnumerateArray().ToList();
    }

    [Fact]
    public async Task GetMyTrustedDevices_WithoutAuthentication_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await SeedAsync(factory);
        var client = factory.CreateApiClient();

        var response = await client.GetAsync("/api/trusted-devices/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData(UserRole.Official)]
    [InlineData(UserRole.GovernmentAdministrator)]
    public async Task GetMyTrustedDevices_ForANonCitizen_ReturnsForbidden(UserRole role)
    {
        using var factory = new TestApiFactory();
        await SeedAsync(factory);

        var user = BuildUser(role);
        var db = await factory.CreateInitializedContextAsync();
        await db.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = ClientFor(factory, user);

        var response = await client.GetAsync("/api/trusted-devices/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetMyTrustedDevices_ReturnsOnlyTheCallersOwnDevices()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.GetAsync("/api/trusted-devices/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var devices = await ReadDevicesAsync(response);

        Assert.Equal(2, devices.Count);
        Assert.DoesNotContain(devices, d => d.GetProperty("id").GetGuid() == seed.ForeignDevice.Id);
    }

    [Fact]
    public async Task GetMyTrustedDevices_WithNoDeviceToken_MarksNothingAsTheCurrentDevice()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.GetAsync("/api/trusted-devices/me", TestContext.Current.CancellationToken);
        var devices = await ReadDevicesAsync(response);

        Assert.All(devices, d => Assert.False(d.GetProperty("isCurrentDevice").GetBoolean()));
    }

    [Fact]
    public async Task GetMyTrustedDevices_WithTheDeviceTokenHeader_FlagsTheMatchingDevice()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);
        client.DefaultRequestHeaders.Add("X-Device-Token", CurrentDeviceToken);

        var response = await client.GetAsync("/api/trusted-devices/me", TestContext.Current.CancellationToken);
        var devices = await ReadDevicesAsync(response);

        var current = Assert.Single(devices, d => d.GetProperty("isCurrentDevice").GetBoolean());

        Assert.Equal(seed.CurrentDevice.Id, current.GetProperty("id").GetGuid());
    }

    [Fact]
    public async Task GetMyTrustedDevices_FallsBackToTheDeviceCookieWhenNoHeaderIsSent()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/trusted-devices/me");
        request.Headers.Add("Cookie", $"flashid_device={CurrentDeviceToken}");

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);
        var devices = await ReadDevicesAsync(response);

        var current = Assert.Single(devices, d => d.GetProperty("isCurrentDevice").GetBoolean());

        Assert.Equal(seed.CurrentDevice.Id, current.GetProperty("id").GetGuid());
    }

    [Fact]
    public async Task GetMyTrustedDevices_PrefersTheHeaderOverTheCookie()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/trusted-devices/me");
        request.Headers.Add("X-Device-Token", OtherDeviceToken);
        request.Headers.Add("Cookie", $"flashid_device={CurrentDeviceToken}");

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);
        var devices = await ReadDevicesAsync(response);

        var current = Assert.Single(devices, d => d.GetProperty("isCurrentDevice").GetBoolean());

        Assert.Equal(seed.NamelessDevice.Id, current.GetProperty("id").GetGuid());
    }

    [Fact]
    public async Task GetMyTrustedDevices_KeepsAStoredDeviceNameWhenOneExists()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.GetAsync("/api/trusted-devices/me", TestContext.Current.CancellationToken);
        var devices = await ReadDevicesAsync(response);

        var named = Assert.Single(devices, d => d.GetProperty("id").GetGuid() == seed.CurrentDevice.Id);

        Assert.Equal("Thandiwe's Laptop", named.GetProperty("deviceName").GetString());
    }

    [Fact]
    public async Task GetMyTrustedDevices_BuildsAFallbackNameForAnUnnamedDevice()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.GetAsync("/api/trusted-devices/me", TestContext.Current.CancellationToken);
        var devices = await ReadDevicesAsync(response);

        var unnamed = Assert.Single(devices, d => d.GetProperty("id").GetGuid() == seed.NamelessDevice.Id);

        Assert.Equal("Safari on macOS 15", unnamed.GetProperty("deviceName").GetString());
    }

    [Fact]
    public async Task GetMyTrustedDevices_ProjectsLocationAndActivityOntoEachDevice()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.GetAsync("/api/trusted-devices/me", TestContext.Current.CancellationToken);
        var devices = await ReadDevicesAsync(response);

        var device = Assert.Single(devices, d => d.GetProperty("id").GetGuid() == seed.CurrentDevice.Id);

        Assert.Equal("Pretoria", device.GetProperty("lastKnownCity").GetString());
        Assert.Equal("South Africa", device.GetProperty("lastKnownCountry").GetString());
        Assert.Equal("Chrome", device.GetProperty("browser").GetString());
        Assert.Equal("Windows 11", device.GetProperty("operatingSystem").GetString());
        Assert.True(device.GetProperty("isTrusted").GetBoolean());
    }

    [Fact]
    public async Task UnlinkDevice_WithoutAuthentication_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = factory.CreateApiClient();

        var response = await client.DeleteAsync($"/api/trusted-devices/{seed.CurrentDevice.Id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UnlinkDevice_AsOfficial_ReturnsForbidden()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);

        var official = BuildUser(UserRole.Official);
        var db = await factory.CreateInitializedContextAsync();
        await db.DomainUsers.AddAsync(official, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = ClientFor(factory, official);

        var response = await client.DeleteAsync($"/api/trusted-devices/{seed.CurrentDevice.Id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UnlinkDevice_WithANonGuidId_DoesNotMatchTheRoute()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.DeleteAsync("/api/trusted-devices/not-a-guid", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UnlinkDevice_ForAnUnknownDevice_ReturnsNotFound()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.DeleteAsync($"/api/trusted-devices/{Guid.NewGuid()}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UnlinkDevice_ForSomeoneElsesDevice_ReturnsNotFoundAndLeavesItTrusted()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.DeleteAsync($"/api/trusted-devices/{seed.ForeignDevice.Id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var db = await factory.CreateInitializedContextAsync();
        var stored = await db.TrustedDevices.FirstAsync(d => d.Id == seed.ForeignDevice.Id, TestContext.Current.CancellationToken);

        Assert.True(stored.IsTrusted);
    }

    [Fact]
    public async Task UnlinkDevice_ForOwnDevice_ReturnsNoContentAndRevokesTrust()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.DeleteAsync($"/api/trusted-devices/{seed.CurrentDevice.Id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var db = await factory.CreateInitializedContextAsync();
        var stillPresent = await db.TrustedDevices.AnyAsync(d => d.Id == seed.CurrentDevice.Id, TestContext.Current.CancellationToken);

        Assert.False(stillPresent);
    }
}
