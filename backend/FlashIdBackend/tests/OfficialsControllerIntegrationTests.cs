using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.ManageUserAccountCard.DTOs;
using Application.Features.Officials.DTOs;
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

public class OfficialsControllerIntegrationTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR - test-only dummy key, not a real secret
    private const string JwtIssuer = "FlashId";
    private const string JwtAudience = "FlashIdWeb";
    private const string QrPrivateKey = "8O/E1cl/UPWEcxPaC6NvN2GSh1ged35YBOP8ACZf0K0="; // NOSONAR - test-only dummy key, not a real secret

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
                    ["Qr:Ed25519PrivateKey"] = QrPrivateKey,
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
        public User OfficialUser = null!;
        public Official Official = null!;
        public Institution Institution = null!;
        public Citizen Citizen = null!;
        public User CitizenUser = null!;
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

    private static AuditLog Log(
        AuditEventType eventType,
        Guid actorId,
        string details,
        DateTime createdAt,
        Guid? citizenId = null) => new()
        {
            Id = Guid.NewGuid(),
            EventType = eventType,
            Details = details,
            IpAddress = "192.168.1.10",
            ActorId = actorId,
            CitizenId = citizenId,
            CreatedAt = createdAt,
        };

    private static async Task<Seeded> SeedAsync(TestApiFactory factory)
    {
        var db = await factory.CreateInitializedContextAsync();
        var ct = TestContext.Current.CancellationToken;

        var adminUser = BuildUser(UserRole.GovernmentAdministrator);
        var admin = new GovernmentAdministrator
        {
            Id = Guid.NewGuid(),
            GovernmentId = "GA-0001",
            Names = "Admin",
            Surname = "User",
            UserId = adminUser.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var institution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = "Home Affairs Pretoria",
            Type = InstitutionType.HomeAffairs,
            ApiKeyReference = Guid.NewGuid(),
            VerificationNumber = "HA-001",
            RegisteredById = admin.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var officialUser = BuildUser(UserRole.Official);
        var official = new Official
        {
            Id = Guid.NewGuid(),
            OfficialId = "OF-0001",
            Names = "Sipho",
            Surname = "Ndlovu",
            UserId = officialUser.Id,
            InstitutionId = institution.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var citizenUser = BuildUser(UserRole.Citizen);
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = "9001015800085",
            Names = "Thandiwe",
            Surname = "Dlamini",
            DateOfBirth = new DateTime(1990, 1, 1),
            Status = CitizenStatus.Verified,
            UserId = citizenUser.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await db.DomainUsers.AddRangeAsync(new[] { adminUser, officialUser, citizenUser }, ct);
        await db.GovernmentAdministrators.AddAsync(admin, ct);
        await db.Institutions.AddAsync(institution, ct);
        await db.Officials.AddAsync(official, ct);
        await db.Citizens.AddAsync(citizen, ct);

        var now = DateTime.UtcNow;
        await db.AuditLogs.AddRangeAsync(new[]
        {
            Log(AuditEventType.CredentialVerified, officialUser.Id, "Verified an identity document.", now.AddMinutes(-5), citizen.Id),
            Log(AuditEventType.CredentialVerified, officialUser.Id, "Verified a drivers license.", now.AddMinutes(-10), citizen.Id),
            Log(AuditEventType.OnboardCitizen, officialUser.Id, "Onboarded a new citizen.", now.AddDays(-2), citizen.Id),
            Log(AuditEventType.OnboardCitizenFailed, officialUser.Id, "Onboarding rejected by registry.", now.AddDays(-3)),
            Log(AuditEventType.CitizenStatusViewed, officialUser.Id, "Viewed citizen status.", now.AddDays(-4), citizen.Id),
            Log(AuditEventType.AuditLogViewed, officialUser.Id, "Viewed institution audit history.", now.AddDays(-5)),
        }, ct);

        await db.SaveChangesAsync(ct);

        return new Seeded
        {
            OfficialUser = officialUser,
            Official = official,
            Institution = institution,
            Citizen = citizen,
            CitizenUser = citizenUser,
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

    private static async Task<JsonElement> GetHistoryAsync(HttpClient client, string query = "")
    {
        var response = await client.GetAsync($"/api/officials/history{query}", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await ReadBodyAsync(response);
    }

    private static List<string> ActionsOf(JsonElement history) =>
        history.GetProperty("items").EnumerateArray()
            .Select(i => i.GetProperty("action").GetString()!)
            .ToList();

    [Fact]
    public async Task GenerateBadgeToken_AsOfficial_ReturnsASignedToken()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var response = await client.PostAsync("/api/officials/badge-token", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadBodyAsync(response);
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("token").GetString()));
    }

    [Fact]
    public async Task GenerateBadgeToken_AsCitizen_ReturnsForbidden()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.PostAsync("/api/officials/badge-token", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GenerateBadgeToken_ForAUserWithNoOfficialRecord_ReturnsNotFound()
    {
        using var factory = new TestApiFactory();
        await SeedAsync(factory);

        var stray = BuildUser(UserRole.Official);
        var db = await factory.CreateInitializedContextAsync();
        await db.DomainUsers.AddAsync(stray, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = ClientFor(factory, stray);

        var response = await client.PostAsync("/api/officials/badge-token", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task VerifyBadge_WithATokenThisServiceIssued_ReturnsOk()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var issued = await client.PostAsync("/api/officials/badge-token", null, TestContext.Current.CancellationToken);
        var token = (await ReadBodyAsync(issued)).GetProperty("token").GetString();

        var response = await client.PostAsJsonAsync(
            "/api/officials/verify-badge",
            new VerifyBadgeRequestDto { Token = token! },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task VerifyBadge_WithAMalformedToken_ReturnsBadRequest()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.PostAsJsonAsync(
            "/api/officials/verify-badge",
            new VerifyBadgeRequestDto { Token = "not-a-real-token" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task VerifyBadge_WithoutAuthentication_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await SeedAsync(factory);
        var client = factory.CreateApiClient();

        var response = await client.PostAsJsonAsync(
            "/api/officials/verify-badge",
            new VerifyBadgeRequestDto { Token = "anything" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMyActivity_AsOfficial_ExcludesViewOnlyEvents()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var response = await client.GetAsync("/api/officials/activity/me?limit=20", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var items = (await ReadBodyAsync(response)).GetProperty("items").EnumerateArray()
            .Select(i => i.GetProperty("eventType").GetString()).ToList();

        Assert.DoesNotContain(nameof(AuditEventType.AuditLogViewed), items);
        Assert.DoesNotContain(nameof(AuditEventType.CitizenStatusViewed), items);
        Assert.Contains(nameof(AuditEventType.CredentialVerified), items);
    }

    [Fact]
    public async Task GetMyActivity_WithAnOversizedLimit_ClampsToTwenty()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var response = await client.GetAsync("/api/officials/activity/me?limit=500", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var items = (await ReadBodyAsync(response)).GetProperty("items").EnumerateArray().ToList();
        Assert.True(items.Count <= 20);
    }

    [Fact]
    public async Task GetMyActivity_AsCitizen_ReturnsForbidden()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.GetAsync("/api/officials/activity/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetHistory_WithoutAuthentication_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await SeedAsync(factory);
        var client = factory.CreateApiClient();

        var response = await client.GetAsync("/api/officials/history", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetHistory_AsCitizen_ReturnsForbidden()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.GetAsync("/api/officials/history", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetHistory_ForAnOfficialRoleWithNoOfficialRecord_ReturnsUnauthorized()
    {
        using var factory = new TestApiFactory();
        await SeedAsync(factory);

        var stray = BuildUser(UserRole.Official);
        var db = await factory.CreateInitializedContextAsync();
        await db.DomainUsers.AddAsync(stray, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = ClientFor(factory, stray);

        var response = await client.GetAsync("/api/officials/history", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetHistory_ExcludesAuditLogViewedEntriesFromItsOwnResults()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var history = await GetHistoryAsync(client, "?pageSize=100");

        Assert.DoesNotContain(nameof(AuditEventType.AuditLogViewed), ActionsOf(history));
        Assert.Contains(nameof(AuditEventType.CitizenStatusViewed), ActionsOf(history));
    }

    [Fact]
    public async Task GetHistory_FiltersByAction()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var history = await GetHistoryAsync(client, "?action=CredentialVerified&pageSize=100");

        Assert.Equal(2, history.GetProperty("totalCount").GetInt32());
        Assert.All(ActionsOf(history), a => Assert.Equal(nameof(AuditEventType.CredentialVerified), a));
    }

    [Fact]
    public async Task GetHistory_FiltersByDateWindow()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var from = DateTime.UtcNow.AddDays(-1).ToString("O");
        var history = await GetHistoryAsync(client, $"?dateFrom={Uri.EscapeDataString(from)}&pageSize=100");

        Assert.Equal(2, history.GetProperty("totalCount").GetInt32());
    }

    [Theory]
    [InlineData("Failed", nameof(AuditEventType.OnboardCitizenFailed))]
    [InlineData("Access", nameof(AuditEventType.CitizenStatusViewed))]
    public async Task GetHistory_FiltersByOutcomeType(string type, string expectedAction)
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var history = await GetHistoryAsync(client, $"?type={type}&pageSize=100");

        Assert.Contains(expectedAction, ActionsOf(history));
    }

    [Fact]
    public async Task GetHistory_WithSuccessOutcome_ExcludesFailuresAndViews()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var history = await GetHistoryAsync(client, "?type=Success&pageSize=100");
        var actions = ActionsOf(history);

        Assert.DoesNotContain(nameof(AuditEventType.OnboardCitizenFailed), actions);
        Assert.DoesNotContain(nameof(AuditEventType.CitizenStatusViewed), actions);
        Assert.Contains(nameof(AuditEventType.CredentialVerified), actions);
    }

    [Theory]
    [InlineData("drivers", 1)]
    [InlineData("Dlamini", 4)]
    [InlineData("Ndlovu", 5)]
    [InlineData("9001015800085", 4)]
    public async Task GetHistory_SearchesDetailsCitizenAndOfficialFields(string search, int expectedCount)
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var history = await GetHistoryAsync(client, $"?search={search}&pageSize=100");

        Assert.Equal(expectedCount, history.GetProperty("totalCount").GetInt32());
    }

    [Fact]
    public async Task GetHistory_SearchingForFailedMatchesFailureEvents()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var history = await GetHistoryAsync(client, "?search=failed&pageSize=100");

        Assert.Contains(nameof(AuditEventType.OnboardCitizenFailed), ActionsOf(history));
    }

    [Fact]
    public async Task GetHistory_PagesResultsAndReportsTheFullTotal()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var firstPage = await GetHistoryAsync(client, "?page=1&pageSize=2");
        var secondPage = await GetHistoryAsync(client, "?page=2&pageSize=2");

        Assert.Equal(2, firstPage.GetProperty("items").GetArrayLength());
        Assert.Equal(5, firstPage.GetProperty("totalCount").GetInt32());
        Assert.Equal(5, secondPage.GetProperty("totalCount").GetInt32());
        Assert.Equal(2, secondPage.GetProperty("page").GetInt32());

        var firstIds = firstPage.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("id").GetGuid());
        var secondIds = secondPage.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("id").GetGuid());
        Assert.Empty(firstIds.Intersect(secondIds));
    }

    [Fact]
    public async Task GetHistory_ProjectsCitizenAndPerformingOfficialOntoEachRow()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var history = await GetHistoryAsync(client, "?action=CredentialVerified&pageSize=100");
        var row = history.GetProperty("items")[0];

        Assert.Equal("Thandiwe Dlamini", row.GetProperty("citizenName").GetString());
        Assert.Equal("9001015800085", row.GetProperty("citizenSaId").GetString());
        Assert.Equal("Sipho Ndlovu", row.GetProperty("performedBy").GetString());
        Assert.Equal("Success", row.GetProperty("outcome").GetString());
    }

    [Fact]
    public async Task GetHistory_NeverLeaksAnotherInstitutionsAuditTrail()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var ct = TestContext.Current.CancellationToken;
        var db = await factory.CreateInitializedContextAsync();

        var otherAdminUser = BuildUser(UserRole.GovernmentAdministrator);
        var otherAdmin = new GovernmentAdministrator
        {
            Id = Guid.NewGuid(),
            GovernmentId = "GA-0002",
            Names = "Other",
            Surname = "Admin",
            UserId = otherAdminUser.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var otherInstitution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = "Home Affairs Durban",
            Type = InstitutionType.HomeAffairs,
            ApiKeyReference = Guid.NewGuid(),
            VerificationNumber = "HA-002",
            RegisteredById = otherAdmin.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var otherOfficialUser = BuildUser(UserRole.Official);
        var otherOfficial = new Official
        {
            Id = Guid.NewGuid(),
            OfficialId = "OF-0002",
            Names = "Naledi",
            Surname = "Mokoena",
            UserId = otherOfficialUser.Id,
            InstitutionId = otherInstitution.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await db.DomainUsers.AddRangeAsync(new[] { otherAdminUser, otherOfficialUser }, ct);
        await db.GovernmentAdministrators.AddAsync(otherAdmin, ct);
        await db.Institutions.AddAsync(otherInstitution, ct);
        await db.Officials.AddAsync(otherOfficial, ct);
        await db.AuditLogs.AddAsync(
            Log(AuditEventType.CredentialVerified, otherOfficialUser.Id, "Durban verification.", DateTime.UtcNow), ct);
        await db.SaveChangesAsync(ct);

        var client = ClientFor(factory, seed.OfficialUser);
        var history = await GetHistoryAsync(client, "?pageSize=100");

        var details = history.GetProperty("items").EnumerateArray()
            .Select(i => i.GetProperty("details").GetString()!).ToList();

        Assert.DoesNotContain("Durban verification.", details);
        Assert.Equal(5, history.GetProperty("totalCount").GetInt32());
    }

    [Fact]
    public async Task GetHistory_AuditsTheFactThatSomeoneReadTheAuditTrail()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        await GetHistoryAsync(client);

        var db = await factory.CreateInitializedContextAsync();
        var viewLogs = await db.AuditLogs
            .Where(a => a.EventType == AuditEventType.AuditLogViewed && a.ActorId == seed.OfficialUser.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        Assert.Equal(2, viewLogs.Count);
    }

    [Fact]
    public async Task GetHistoryActions_ReturnsDistinctActionsSortedAndWithoutViewEvents()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var response = await client.GetAsync("/api/officials/history/actions", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var actions = (await ReadBodyAsync(response)).GetProperty("actions").EnumerateArray()
            .Select(a => a.GetString()!).ToList();

        Assert.Equal(actions.OrderBy(a => a, StringComparer.Ordinal), actions);
        Assert.Equal(actions.Distinct().Count(), actions.Count);
        Assert.DoesNotContain(nameof(AuditEventType.AuditLogViewed), actions);
        Assert.DoesNotContain(nameof(AuditEventType.CitizenStatusViewed), actions);
        Assert.Contains(nameof(AuditEventType.CredentialVerified), actions);
    }

    [Fact]
    public async Task GetHistoryActions_AsCitizen_ReturnsForbidden()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.GetAsync("/api/officials/history/actions", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetMyStats_CountsOnlyTodaysVerificationsForTheOwnInstitution()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.OfficialUser);

        var response = await client.GetAsync("/api/officials/stats/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadBodyAsync(response);
        Assert.Equal(2, body.GetProperty("todayCount").GetInt32());
        Assert.False(body.GetProperty("isCapped").GetBoolean());
    }

    [Fact]
    public async Task GetMyStats_AsCitizen_ReturnsForbidden()
    {
        using var factory = new TestApiFactory();
        var seed = await SeedAsync(factory);
        var client = ClientFor(factory, seed.CitizenUser);

        var response = await client.GetAsync("/api/officials/stats/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
