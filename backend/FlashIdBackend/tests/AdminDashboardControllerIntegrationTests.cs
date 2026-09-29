using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
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

public class AdminDashboardControllerIntegrationTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; //NOSONAR - not a real secret
    private const string JwtIssuer = "FlashId";
    private const string JwtAudience = "FlashIdWeb";

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

    private sealed class Seeded
    {
        public User AdminUser = null!;
        public User CitizenUser = null!;
        public User OfficialUserOne = null!;
        public User OfficialUserTwo = null!;
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
        PasswordHash = "hash", // NOSONAR - not a real secret
        Role = role,
        IsEmailVerified = true,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
    };

    private static AuditLog Log(AuditEventType eventType, Guid? actorId, string details, DateTime createdAt) => new()
    {

        Id = Guid.NewGuid(),
        EventType = eventType,
        Details = details,
        IpAddress = "192.168.1.10",
        ActorId = actorId,
        CreatedAt = createdAt,
    };

    private static async Task<Seeded> SeedAsync(TestApiFactory factory)
    {
        var db = await factory.CreateInitializedContextAsync();
        var ct = TestContext.Current.CancellationToken;
        var today = DateTime.UtcNow;

        var adminUser = BuildUser(UserRole.GovernmentAdministrator);
        var citizenUser = BuildUser(UserRole.Citizen);
        var officialUserOne = BuildUser(UserRole.Official);
        var officialUserTwo = BuildUser(UserRole.Official);

        var admin = new GovernmentAdministrator
        {

            Id = Guid.NewGuid(),
            GovernmentId = "GA-0001",
            Names = "Admin",
            Surname = "User",
            UserId = adminUser.Id,
            CreatedAt = today,
            UpdatedAt = today,
        };

        var institutionOne = new Institution
        {

            Id = Guid.NewGuid(),
            Name = "Home Affairs Pretoria",
            Type = InstitutionType.HomeAffairs,
            ApiKeyReference = Guid.NewGuid(),
            VerificationNumber = "HA-001",
            RegisteredById = admin.Id,
            CreatedAt = today,
            UpdatedAt = today,
        };

        var institutionTwo = new Institution
        {

            Id = Guid.NewGuid(),
            Name = "Licensing Durban",
            Type = InstitutionType.LicensingDepartment,
            ApiKeyReference = Guid.NewGuid(),
            VerificationNumber = "LD-001",
            RegisteredById = admin.Id,
            CreatedAt = today,
            UpdatedAt = today,
        };

        var officialOne = new Official
        {
            Id = Guid.NewGuid(),
            OfficialId = "OF-0001",
            Names = "Sipho",
            Surname = "Ndlovu",
            UserId = officialUserOne.Id,
            InstitutionId = institutionOne.Id,
            CreatedAt = today,
            UpdatedAt = today,
        };

        var officialTwo = new Official
        {
            Id = Guid.NewGuid(),
            OfficialId = "OF-0002",
            Names = "Naledi",
            Surname = "Mokoena",
            UserId = officialUserTwo.Id,
            InstitutionId = institutionTwo.Id,
            CreatedAt = today,
            UpdatedAt = today,
        };

        var citizen = new Citizen
        {

            Id = Guid.NewGuid(),
            SaId = "9001015800085",
            Names = "Thandiwe",
            Surname = "Dlamini",
            DateOfBirth = new DateTime(1990, 1, 1),
            Status = CitizenStatus.Verified,
            UserId = citizenUser.Id,
            CreatedAt = today,
            UpdatedAt = today,
        };

        await db.DomainUsers.AddRangeAsync(new[] { adminUser, citizenUser, officialUserOne, officialUserTwo }, ct);
        await db.GovernmentAdministrators.AddAsync(admin, ct);
        await db.Institutions.AddRangeAsync(new[] { institutionOne, institutionTwo }, ct);
        await db.Officials.AddRangeAsync(new[] { officialOne, officialTwo }, ct);
        await db.Citizens.AddAsync(citizen, ct);

        await db.Credentials.AddRangeAsync(new[]
        {
            new Credential
            {
                Id = Guid.NewGuid(), CitizenId =  citizen.Id, Status =  CredentialStatus.Active,
                Signature = "sig-1", IssuedBy =  "Home Affairs", IssueDate =  today.AddDays(-1),
                CreatedAt = today.AddDays(-1), UpdatedAt =  today.AddDays(-1),
            },
            new Credential
            {
                Id = Guid.NewGuid(), CitizenId =  citizen.Id, Status =  CredentialStatus.Active,
                Signature = "sig-2", IssuedBy =  "Licensing", IssueDate =  today.AddDays(-2),
                CreatedAt = today.AddDays(-2), UpdatedAt =  today.AddDays(-2),
            },
        }, ct);

        await db.AuditLogs.AddRangeAsync(new[]
        {
            Log(AuditEventType.UserRegistered, citizenUser.Id, "A citizen registered.", today.AddHours(-1)),
            Log(AuditEventType.InstitutionRegistered, adminUser.Id, "An institution was registered.", today.AddHours(-2)),
            Log(AuditEventType.CredentialIssued, officialUserOne.Id, "A credential was issued.", today.AddDays(-1)),
            Log(AuditEventType.CredentialRevoked, adminUser.Id, "A credential was revoked.", today.AddDays(-2)),
            Log(AuditEventType.CredentialVerified, officialUserOne.Id, "Verified once.", today.AddDays(-1)),
            Log(AuditEventType.CredentialVerified, officialUserTwo.Id, "Verified twice.", today.AddDays(-1)),
            Log(AuditEventType.CitizenStatusViewed, officialUserOne.Id, "A view event, not system level.", today.AddHours(-3)),
        }, ct);

        await db.SaveChangesAsync(ct);

        return new Seeded
        {
            AdminUser = adminUser,
            CitizenUser = citizenUser,
            OfficialUserOne = officialUserOne,
            OfficialUserTwo = officialUserTwo,
        };
    }

    private static HttpClient ClientFor(TestApiFactory factory, User user)
    {

        var client = factory.CreateApiClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(user));
        return client;
    }

    private static async Task<JsonElement> ReadBodyAsync(HttpResponseMessage response) =>
        await response.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);

    private static int SeriesTotal(JsonElement metric) =>
        metric.GetProperty("series").EnumerateArray().Sum(p => p.GetProperty("count").GetInt32());

    [Fact]
    public async Task DashboardSummary_WithoutAuthentication_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await SeedAsync(factory);
        var client = factory.CreateApiClient();

        var response = await client.GetAsync("/api/admin/dashboard-summary", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData(UserRole.Citizen)]
    [InlineData(UserRole.Official)]
    public async Task DashboardSummary_ForAnyNonAdministrator_ReturnsForbidden(UserRole role)
    {

        using var factory = new TestApiFactory();
        await SeedAsync(factory);

        var user = BuildUser(role);
        var db = await factory.CreateInitializedContextAsync();
        await db.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = ClientFor(factory, user);

        var response = await client.GetAsync("/api/admin/dashboard-summary", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DashboardSummary_AsAdministrator_ReportsLiveCounts()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.AdminUser);

        var response = await client.GetAsync("/api/admin/dashboard-summary", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var counts = (await ReadBodyAsync(response)).GetProperty("counts");
        Assert.Equal(4, counts.GetProperty("users").GetInt32());
        Assert.Equal(2, counts.GetProperty("institutions").GetInt32());
        Assert.Equal(2, counts.GetProperty("credentialsIssued").GetInt32());
    }

    [Fact]
    public async Task DashboardSummary_ReportsTheSystemAsOperational()
    {

        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.AdminUser);
        var before = DateTime.UtcNow;

        var response = await client.GetAsync("/api/admin/dashboard-summary", TestContext.Current.CancellationToken);

        var status = (await ReadBodyAsync(response)).GetProperty("systemStatus");
        Assert.True(status.GetProperty("operational").GetBoolean());
        Assert.InRange(status.GetProperty("lastUpdatedAt").GetDateTime(), before.AddSeconds(-5), DateTime.UtcNow.AddSeconds(5));
    }

    [Fact]
    public async Task DashboardSummary_FeedShowsOnlySystemLevelEventsNewestFirst()
    {

        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.AdminUser);

        var response = await client.GetAsync("/api/admin/dashboard-summary", TestContext.Current.CancellationToken);

        var feed = (await ReadBodyAsync(response)).GetProperty("activityFeed").EnumerateArray().ToList();
        var eventTypes = feed.Select(i => i.GetProperty("eventType").GetString()!).ToList();

        Assert.Equal(4, feed.Count);
        Assert.DoesNotContain(nameof(AuditEventType.CitizenStatusViewed), eventTypes);
        Assert.DoesNotContain(nameof(AuditEventType.CredentialVerified), eventTypes);
        Assert.Equal(nameof(AuditEventType.UserRegistered), eventTypes[0]);

        var timestamps = feed.Select(i => i.GetProperty("createdAt").GetDateTime()).ToList();
        Assert.Equal(timestamps.OrderByDescending(t => t), timestamps);
    }

    [Fact]
    public async Task Analytics_AsCitizen_ReturnsForbidden()
    {

        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.GetAsync("/api/admin/analytics", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("1d")]
    [InlineData("60d")]
    [InlineData("week")]
    public async Task Analytics_WithAnUnsupportedRange_ReturnsBadRequest(string range)
    {

        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.AdminUser);

        var response = await client.GetAsync($"/api/admin/analytics?range={range}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("", 31)]
    [InlineData("7d", 8)]
    [InlineData("30d", 31)]
    [InlineData("90d", 91)]
    public async Task Analytics_ReturnsAZeroFilledSeriesSpanningTheWholeRange(string range, int expectedPoints)
    {

        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.AdminUser);

        var query = string.IsNullOrEmpty(range) ? string.Empty : $"?range={range}";
        var response = await client.GetAsync($"/api/admin/analytics{query}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadBodyAsync(response);

        foreach (var metric in new[] { "verifications", "credentialsIssued", "activeOfficials", "activeInstitutions" })
        {
            Assert.Equal(expectedPoints, body.GetProperty(metric).GetProperty("series").GetArrayLength());
        }
    }

    [Fact]
    public async Task Analytics_CountsVerificationEventsWithinTheWindow()
    {

        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.AdminUser);

        var response = await client.GetAsync("/api/admin/analytics?range=7d", TestContext.Current.CancellationToken);
        var verifications = (await ReadBodyAsync(response)).GetProperty("verifications");

        Assert.Equal(2, verifications.GetProperty("value").GetInt32());
        Assert.Equal(2, SeriesTotal(verifications));
    }

    [Fact]
    public async Task Analytics_CountsCredentialsByTheDayTheyWereCreated()
    {

        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.AdminUser);

        var response = await client.GetAsync("/api/admin/analytics?range=7d", TestContext.Current.CancellationToken);
        var issued = (await ReadBodyAsync(response)).GetProperty("credentialsIssued");

        Assert.Equal(2, issued.GetProperty("value").GetInt32());
        Assert.All(
            issued.GetProperty("series").EnumerateArray(),
            p => Assert.True(p.GetProperty("count").GetInt32() <= 1));
    }

    [Fact]
    public async Task Analytics_CountsEachActiveOfficialAndInstitutionOncePerDay()
    {

        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.AdminUser);

        var response = await client.GetAsync("/api/admin/analytics?range=7d", TestContext.Current.CancellationToken);
        var body = await ReadBodyAsync(response);

        var officials = body.GetProperty("activeOfficials").GetProperty("series");
        var institutions = body.GetProperty("activeInstitutions").GetProperty("series");

        Assert.All(officials.EnumerateArray(), p => Assert.True(p.GetProperty("count").GetInt32() <= 2));
        Assert.All(institutions.EnumerateArray(), p => Assert.True(p.GetProperty("count").GetInt32() <= 2));

        Assert.Contains(officials.EnumerateArray(), p => p.GetProperty("count").GetInt32() == 2);
        Assert.Contains(institutions.EnumerateArray(), p => p.GetProperty("count").GetInt32() == 2);
    }

    [Fact]
    public async Task Analytics_WithNoPriorPeriodActivity_ReportsAnUnknownChange()
    {

        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.AdminUser);

        var response = await client.GetAsync("/api/admin/analytics?range=7d", TestContext.Current.CancellationToken);
        var verifications = (await ReadBodyAsync(response)).GetProperty("verifications");

        Assert.Equal(JsonValueKind.Null, verifications.GetProperty("changePct").ValueKind);
    }

    [Fact]
    public async Task Analytics_WithNoActivityAtAll_ReportsZeroChangeRatherThanUnknown()
    {

        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.AdminUser);

        var db = await factory.CreateInitializedContextAsync();
        var ct = TestContext.Current.CancellationToken;
        db.AuditLogs.RemoveRange(await db.AuditLogs.ToListAsync(ct));
        await db.SaveChangesAsync(ct);

        var response = await client.GetAsync("/api/admin/analytics?range=7d", TestContext.Current.CancellationToken);
        var verifications = (await ReadBodyAsync(response)).GetProperty("verifications");

        Assert.Equal(0, verifications.GetProperty("value").GetInt32());
        Assert.Equal(0, verifications.GetProperty("changePct").GetDouble());
    }
}
