using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Auth.DTOs;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Application.Features.FraudDetection.DTOs;
using Application.Features.ManageUserAccountCard.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Providers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Moq;
using Presentation.Controllers;

namespace tests;

public class FraudDetectionControllerIntegrationTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR - test-only dummy key, not a real secret
    private const string JwtIssuer = "FlashId";
    private const string JwtAudience = "FlashIdWeb";
    private const string Password = "Correct#Pass1"; // NOSONAR - test-only dummy credential

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() },
    };

    private const string JohannesburgIp = "41.0.0.1";
    private const string LondonIp = "81.2.69.160";

    private sealed class StubIpGeolocationProvider : IIpGeolocationProvider
    {
        public Task<IpLocationResult?> GetLocationAsync(string ipAddress, CancellationToken cancellationToken) =>
            Task.FromResult(ipAddress switch
            {
                JohannesburgIp => new IpLocationResult { City = "Johannesburg", Country = "South Africa", Latitude = -26.2041, Longitude = 28.0473 },
                LondonIp => new IpLocationResult { City = "London", Country = "United Kingdom", Latitude = 51.5074, Longitude = -0.1278 },
                _ => null,
            });
    }

    private sealed class ThrowingFraudDetectionService : IFraudDetectionService
    {
        private static Exception Boom() => new InvalidOperationException("fraud engine down");
        public Task<FraudAssessmentResultDto> RecordSecurityEventAsync(SecurityEventContext context, CancellationToken cancellationToken) => throw Boom();
        public Task EnsureQrGenerationAllowedAsync(SecurityEventContext context, CancellationToken cancellationToken) => throw Boom();
        public Task<FraudAssessmentResultDto> RecordQrGenerationAsync(SecurityEventContext context, CancellationToken cancellationToken) => throw Boom();
        public Task<SecurityOverviewDto> GetSecurityOverviewAsync(Guid userId, CancellationToken cancellationToken) => throw Boom();
        public Task<List<SecurityActivityItemDto>> GetActivityAsync(Guid userId, int limit, CancellationToken cancellationToken) => throw Boom();
        public Task<List<FraudAlertSummaryDto>> GetAlertsAsync(Guid userId, FraudAlertStatus? status, CancellationToken cancellationToken) => throw Boom();
        public Task<FraudAlertDetailsDto> GetAlertDetailsAsync(Guid userId, Guid alertId, CancellationToken cancellationToken) => throw Boom();
        public Task<SecureAccountResultDto> SecureAccountAsync(Guid userId, Guid alertId, SecureAccountRequestDto request, string? currentDeviceToken, string ipAddress, CancellationToken cancellationToken) => throw Boom();
        public Task DismissAlertAsync(Guid userId, Guid alertId, DismissFraudAlertRequestDto request, string ipAddress, CancellationToken cancellationToken) => throw Boom();
        public Task<SecuritySettingsDto> GetSettingsAsync(Guid userId, CancellationToken cancellationToken) => throw Boom();
        public Task<SecuritySettingsDto> UpdateSettingsAsync(Guid userId, UpdateSecuritySettingsRequestDto request, string ipAddress, CancellationToken cancellationToken) => throw Boom();
    }

    private sealed class StubEmailSenderProvider : IEmailSenderProvider
    {
        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class StubQrService : IQrService
    {
        public Task<GenerateQrResponseDto> GenerateQrAsync(Guid credentialId, Guid requestingUserId, GenerateQrRequestDto request) =>
            credentialId == Guid.Empty
                ? throw new CredentialNotFoundException(credentialId)
                : Task.FromResult(new GenerateQrResponseDto { Token = "stub-qr-token", ExpiresAt = DateTime.UtcNow.AddSeconds(60) });

        public Task<List<CredentialSummaryDto>> GetMyCredentialsAsync(Guid userId) => Task.FromResult(new List<CredentialSummaryDto>());

        public Task<ResolveCredentialResponseDto> ResolveAsync(string token, Guid requestingUserId, string ipAddress) =>
            Task.FromResult(new ResolveCredentialResponseDto());
    }

    private sealed class TestApiFactory : WebApplicationFactory<Program>
    {
        private readonly SqliteConnection _connection = new("DataSource=:memory:");
        private readonly bool _throwingFraudService;

        public TestApiFactory(bool throwingFraudService = false)
        {
            _throwingFraudService = throwingFraudService;
        }

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
                services.RemoveAll(typeof(IIpGeolocationProvider));
                services.AddScoped<IIpGeolocationProvider, StubIpGeolocationProvider>();
                services.RemoveAll(typeof(IEmailSenderProvider));
                services.AddScoped<IEmailSenderProvider, StubEmailSenderProvider>();
                services.RemoveAll(typeof(IQrService));
                services.AddScoped<IQrService, StubQrService>();
                // CredentialsController -> OfflinePackageService -> photo storage needs a real Blob connection string.
                services.RemoveAll(typeof(IPhotoStorageProvider));
                services.AddSingleton(Mock.Of<IPhotoStorageProvider>());
                services.RemoveAll(typeof(IHostedService));

                if (_throwingFraudService)
                {
                    services.RemoveAll(typeof(IFraudDetectionService));
                    services.AddScoped<IFraudDetectionService, ThrowingFraudDetectionService>();
                }
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
            if (disposing) _connection.Dispose();
        }
    }

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static string TokenFor(User user)
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
        var db = await factory.CreateInitializedContextAsync();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = $"user-{Guid.NewGuid():N}@flashid.test",
            PhoneNumber = "+27821234567",
            PasswordHash = new PasswordHashingProvider().HashPassword(Password),
            Role = role,
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.DomainUsers.Add(user);

        if (role == UserRole.Citizen)
        {
            db.Citizens.Add(new Citizen
            {
                Id = Guid.NewGuid(),
                SaId = Random.Shared.NextInt64(1_000_000_000_000, 9_999_999_999_999).ToString(),
                Names = "Thabo",
                Surname = "Mokoena",
                DateOfBirth = new DateTime(1990, 1, 1),
                Status = CitizenStatus.Activated,
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
        }

        await db.SaveChangesAsync(Ct);
        return user;
    }

    private static HttpClient ClientFor(TestApiFactory factory, User user)
    {
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", TokenFor(user));
        return client;
    }

    private static Task<HttpResponseMessage> SimulateAsync(HttpClient client, string city, string country, double lat, double lon) =>
        client.PostAsJsonAsync("/api/security/simulate", new SimulateSecurityEventRequestDto
        {
            City = city,
            Country = country,
            Latitude = lat,
            Longitude = lon,
        }, JsonOptions, Ct);

    private static async Task<Guid> CreateImpossibleTravelAlertAsync(HttpClient client)
    {
        (await SimulateAsync(client, "Johannesburg", "South Africa", -26.2041, 28.0473)).EnsureSuccessStatusCode();
        var response = await SimulateAsync(client, "London", "United Kingdom", 51.5074, -0.1278);
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);
        return body.GetProperty("alertId").GetGuid();
    }

    [Fact]
    public async Task Overview_WithoutAuthentication_Returns401()
    {
        using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/security/overview", Ct);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Overview_AsOfficial_Returns403()
    {
        using var factory = new TestApiFactory();
        var official = await SeedUserAsync(factory, UserRole.Official);

        var response = await ClientFor(factory, official).GetAsync("/api/security/overview", Ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Overview_ForNewCitizen_IsEmpty()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);

        var response = await ClientFor(factory, user).GetAsync("/api/security/overview", Ct);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(body.GetProperty("hasActiveAlert").GetBoolean());
        Assert.Equal(JsonValueKind.Null, body.GetProperty("latestAlert").ValueKind);
    }

    [Fact]
    public async Task Simulate_JohannesburgThenLondon_RaisesHighRiskAlertVisibleInOverviewAndDetails()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);

        var alertId = await CreateImpossibleTravelAlertAsync(client);

        var overview = await client.GetFromJsonAsync<JsonElement>("/api/security/overview", Ct);
        Assert.True(overview.GetProperty("hasActiveAlert").GetBoolean());
        Assert.True(overview.GetProperty("qrGenerationRestricted").GetBoolean());
        Assert.Equal(alertId, overview.GetProperty("latestAlert").GetProperty("id").GetGuid());
        Assert.Equal("High", overview.GetProperty("latestAlert").GetProperty("riskLevel").GetString());

        var details = await client.GetFromJsonAsync<JsonElement>($"/api/security/alerts/{alertId}", Ct);
        Assert.Equal("Possible impossible travel", details.GetProperty("title").GetString());
        Assert.Equal(51.5074, details.GetProperty("suspiciousLocation").GetProperty("latitude").GetDouble());
        Assert.Equal("Johannesburg, South Africa", details.GetProperty("previousLocation").GetProperty("label").GetString());
        Assert.Equal(3, details.GetProperty("availableActions").GetArrayLength());

        var activity = await client.GetFromJsonAsync<JsonElement>("/api/security/activity?limit=10", Ct);
        Assert.Equal(2, activity.GetArrayLength());

        var alerts = await client.GetFromJsonAsync<JsonElement>("/api/security/alerts?status=Open", Ct);
        Assert.Equal(1, alerts.GetArrayLength());
    }

    [Fact]
    public async Task Simulate_WithInvalidCoordinates_Returns400()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);

        var response = await SimulateAsync(ClientFor(factory, user), "Nowhere", "Nowhere", 200, 0);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Simulate_OutsideDevelopmentOrTesting_Returns404()
    {
        var environment = new Mock<IHostEnvironment>();
        environment.SetupGet(e => e.EnvironmentName).Returns(Environments.Production);
        var service = new Mock<IFraudDetectionService>(MockBehavior.Strict);
        var controller = new SecurityController(service.Object, environment.Object);

        var result = await controller.Simulate(new SimulateSecurityEventRequestDto(), CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task AlertDetails_UnknownAlert_Returns404()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);

        var response = await ClientFor(factory, user).GetAsync($"/api/security/alerts/{Guid.NewGuid()}", Ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AlertDetails_OtherCitizensAlert_Returns404()
    {
        using var factory = new TestApiFactory();
        var owner = await SeedUserAsync(factory);
        var intruder = await SeedUserAsync(factory);
        var alertId = await CreateImpossibleTravelAlertAsync(ClientFor(factory, owner));

        var response = await ClientFor(factory, intruder).GetAsync($"/api/security/alerts/{alertId}", Ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task QrToken_WhileRestricted_Returns403WithCode()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);
        var alertId = await CreateImpossibleTravelAlertAsync(client);

        var response = await client.PostAsJsonAsync($"/api/credentials/{Guid.NewGuid()}/qr-token",
            new GenerateQrRequestDto { DisclosedFields = ["names"] }, JsonOptions, Ct);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal("QR_GENERATION_RESTRICTED", body.GetProperty("code").GetString());
        Assert.Equal(alertId, body.GetProperty("alertId").GetGuid());
    }

    [Fact]
    public async Task QrToken_LowRisk_IsGenerated()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);

        var response = await ClientFor(factory, user).PostAsJsonAsync($"/api/credentials/{Guid.NewGuid()}/qr-token",
            new GenerateQrRequestDto { DisclosedFields = ["names"] }, JsonOptions, Ct);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("stub-qr-token", body.GetProperty("token").GetString());
    }

    [Fact]
    public async Task QrToken_DeviceLocationHeaders_DetectImpossibleTravel()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);

        async Task<HttpResponseMessage> QrFrom(string lat, string lon)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"/api/credentials/{Guid.NewGuid()}/qr-token")
            {
                Content = JsonContent.Create(new GenerateQrRequestDto { DisclosedFields = ["names"] }, options: JsonOptions),
            };
            request.Headers.Add("X-Geo-Latitude", lat);
            request.Headers.Add("X-Geo-Longitude", lon);
            return await client.SendAsync(request, Ct);
        }

        var johannesburg = await QrFrom("-26.2041", "28.0473");
        var capeTown = await QrFrom("-33.9249", "18.4241");

        Assert.Equal(HttpStatusCode.OK, johannesburg.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, capeTown.StatusCode);
    }

    [Fact]
    public async Task Secure_LogOutOtherDevices_ReturnsResultSetsCookieAndRevokesOldToken()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);
        var alertId = await CreateImpossibleTravelAlertAsync(client);

        var response = await client.PostAsJsonAsync($"/api/security/alerts/{alertId}/secure",
            new SecureAccountRequestDto { Action = SecureAccountAction.LogOutOtherDevices, Password = Password }, JsonOptions, Ct);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Your account is secured", body.GetProperty("title").GetString());
        Assert.False(body.TryGetProperty("token", out _));
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), c => c.StartsWith("access_token="));

        var withOldToken = await client.GetAsync("/api/security/overview", Ct);
        Assert.Equal(HttpStatusCode.Unauthorized, withOldToken.StatusCode);
    }

    [Fact]
    public async Task Secure_FromNativeClient_ReturnsTokenInBody()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);
        var alertId = await CreateImpossibleTravelAlertAsync(client);
        client.DefaultRequestHeaders.Add("X-Client", "mobile");

        var response = await client.PostAsJsonAsync($"/api/security/alerts/{alertId}/secure",
            new SecureAccountRequestDto { Action = SecureAccountAction.ResetPassword, Password = Password }, JsonOptions, Ct);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("token").GetString()));
        Assert.True(body.GetProperty("requiresPasswordChange").GetBoolean());
    }

    [Fact]
    public async Task Secure_TwiceWithFreshToken_Returns409()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);
        client.DefaultRequestHeaders.Add("X-Client", "mobile");
        var alertId = await CreateImpossibleTravelAlertAsync(client);
        var request = new SecureAccountRequestDto { Action = SecureAccountAction.LogOutOtherDevices, Password = Password };

        var first = await client.PostAsJsonAsync($"/api/security/alerts/{alertId}/secure", request, JsonOptions, Ct);
        var fresh = (await first.Content.ReadFromJsonAsync<JsonElement>(Ct)).GetProperty("token").GetString();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", fresh);

        var second = await client.PostAsJsonAsync($"/api/security/alerts/{alertId}/secure", request, JsonOptions, Ct);

        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Dismiss_WrongPassword_Returns401WithStepUpCode()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);
        var alertId = await CreateImpossibleTravelAlertAsync(client);

        var response = await client.PostAsJsonAsync($"/api/security/alerts/{alertId}/dismiss",
            new DismissFraudAlertRequestDto { Password = "wrong" }, JsonOptions, Ct);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("STEP_UP_FAILED", body.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Dismiss_CorrectPassword_Returns204AndUnblocksQr()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);
        var alertId = await CreateImpossibleTravelAlertAsync(client);

        var response = await client.PostAsJsonAsync($"/api/security/alerts/{alertId}/dismiss",
            new DismissFraudAlertRequestDto { Password = Password }, JsonOptions, Ct);
        var overview = await client.GetFromJsonAsync<JsonElement>("/api/security/overview", Ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.False(overview.GetProperty("qrGenerationRestricted").GetBoolean());
        Assert.False(overview.GetProperty("hasActiveAlert").GetBoolean());
    }

    [Fact]
    public async Task Settings_GetAndUpdate_WithPasswordStepUpForDisabling()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);

        var initial = await client.GetFromJsonAsync<JsonElement>("/api/security/settings", Ct);
        Assert.True(initial.GetProperty("impossibleTravelDetectionEnabled").GetBoolean());

        var denied = await client.PutAsJsonAsync("/api/security/settings",
            new UpdateSecuritySettingsRequestDto { ImpossibleTravelDetectionEnabled = false }, JsonOptions, Ct);
        Assert.Equal(HttpStatusCode.Unauthorized, denied.StatusCode);

        var allowed = await client.PutAsJsonAsync("/api/security/settings",
            new UpdateSecuritySettingsRequestDto { ImpossibleTravelDetectionEnabled = false, Password = Password }, JsonOptions, Ct);
        var body = await allowed.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.OK, allowed.StatusCode);
        Assert.False(body.GetProperty("impossibleTravelDetectionEnabled").GetBoolean());
    }

    private static async Task<HttpResponseMessage> PostQrAsync(HttpClient client, Guid credentialId, params (string Name, string Value)[] headers)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/credentials/{credentialId}/qr-token")
        {
            Content = JsonContent.Create(new GenerateQrRequestDto { DisclosedFields = ["names"] }, options: JsonOptions),
        };
        foreach (var (name, value) in headers)
        {
            request.Headers.Add(name, value);
        }
        return await client.SendAsync(request, Ct);
    }

    [Fact]
    public async Task Secure_WrongPassword_Returns401AndKeepsAlertOpen()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);
        var alertId = await CreateImpossibleTravelAlertAsync(client);

        var response = await client.PostAsJsonAsync($"/api/security/alerts/{alertId}/secure",
            new SecureAccountRequestDto { Action = SecureAccountAction.LogOutOtherDevices, Password = "wrong" }, JsonOptions, Ct);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);
        var overview = await client.GetFromJsonAsync<JsonElement>("/api/security/overview", Ct);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("STEP_UP_FAILED", body.GetProperty("code").GetString());
        Assert.True(overview.GetProperty("hasActiveAlert").GetBoolean());
    }

    [Fact]
    public async Task Settings_DisablingDetection_IsPersistedAsFalseInTheDatabase()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);

        var response = await client.PutAsJsonAsync("/api/security/settings",
            new UpdateSecuritySettingsRequestDto { ImpossibleTravelDetectionEnabled = false, Password = Password }, JsonOptions, Ct);
        response.EnsureSuccessStatusCode();

        var db = await factory.CreateInitializedContextAsync();
        var stored = await db.UserSecurityProfiles.AsNoTracking().SingleAsync(p => p.UserId == user.Id, Ct);
        var reread = await client.GetFromJsonAsync<JsonElement>("/api/security/settings", Ct);

        Assert.False(stored.ImpossibleTravelDetectionEnabled);
        Assert.False(reread.GetProperty("impossibleTravelDetectionEnabled").GetBoolean());
    }

    [Fact]
    public async Task QrToken_FailedGeneration_DoesNotRecordASecurityEvent()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);

        var response = await PostQrAsync(ClientFor(factory, user), Guid.Empty);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var db = await factory.CreateInitializedContextAsync();
        Assert.False(await db.SecurityEvents.AnyAsync(e => e.UserId == user.Id, Ct));
    }

    [Fact]
    public async Task QrToken_SuccessfulGeneration_RecordsASecurityEvent()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);

        var response = await PostQrAsync(ClientFor(factory, user), Guid.NewGuid());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var db = await factory.CreateInitializedContextAsync();
        var evt = await db.SecurityEvents.SingleAsync(e => e.UserId == user.Id, Ct);
        Assert.Equal(SecurityEventType.QrGenerated, evt.EventType);
    }

    [Theory]
    [InlineData("NaN", "28.0473")]
    [InlineData("999", "28.0473")]
    [InlineData("-26.2041", "not-a-number")]
    [InlineData("Infinity", "-Infinity")]
    public async Task QrToken_InvalidGeoHeaders_AreIgnored(string latitude, string longitude)
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);

        var response = await PostQrAsync(ClientFor(factory, user), Guid.NewGuid(),
            ("X-Geo-Latitude", latitude), ("X-Geo-Longitude", longitude));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var db = await factory.CreateInitializedContextAsync();
        var evt = await db.SecurityEvents.SingleAsync(e => e.UserId == user.Id, Ct);
        Assert.Null(evt.Latitude);
        Assert.Null(evt.Longitude);
    }

    [Fact]
    public async Task QrToken_UsesForwardedClientIpBehindAProxy()
    {
        using var factory = new TestApiFactory();
        var user = await SeedUserAsync(factory);
        var client = ClientFor(factory, user);

        var fromJohannesburg = await PostQrAsync(client, Guid.NewGuid(), ("X-Forwarded-For", JohannesburgIp));
        var fromLondon = await PostQrAsync(client, Guid.NewGuid(), ("X-Forwarded-For", LondonIp));
        var body = await fromLondon.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.OK, fromJohannesburg.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, fromLondon.StatusCode);
        Assert.Equal("QR_GENERATION_RESTRICTED", body.GetProperty("code").GetString());

        var db = await factory.CreateInitializedContextAsync();
        Assert.Contains(await db.SecurityEvents.Where(e => e.UserId == user.Id).Select(e => e.IpAddress).ToListAsync(Ct), ip => ip == LondonIp);
    }

    [Fact]
    public async Task Login_WhenFraudDetectionThrows_StillSucceeds()
    {
        using var factory = new TestApiFactory(throwingFraudService: true);
        var user = await SeedUserAsync(factory);
        const string deviceToken = "trusted-browser"; // NOSONAR - test-only dummy token

        var db = await factory.CreateInitializedContextAsync();
        db.TrustedDevices.Add(new TrustedDevice
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            DeviceTokenHash = new DeviceTokenProvider().HashToken(deviceToken),
            DeviceType = DeviceType.Laptop,
            OperatingSystem = "Windows 11",
            Browser = "Chrome",
            DeviceName = "Thabo's Laptop",
            LastActive = DateTime.UtcNow,
            IsTrusted = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            UpdatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(Ct);

        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = JsonContent.Create(new LoginRequestDto { Email = user.Email, Password = Password }, options: JsonOptions),
        };
        request.Headers.Add("X-Device-Token", deviceToken);

        var response = await client.SendAsync(request, Ct);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(body.GetProperty("requiresDeviceVerification").GetBoolean());
        Assert.False(body.TryGetProperty("securityAlert", out _));
    }
}
