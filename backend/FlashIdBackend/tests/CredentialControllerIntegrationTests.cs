using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;
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
using System.Text.Json;
using System.Text.Json.Serialization;
using Application.Features.Citizens.Exceptions;
using Application.Features.Credentials.Exceptions;
using Application.Features.Credentials.Enums;
using Application.Features.Onboarding.Exceptions;

namespace tests;

public class CredentialControllerIntegrationTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR
    private const string JwtIssuer = "FlashId";
    private const string JwtAudience = "FlashIdWeb";

    private sealed class StubQrService : IQrService
    {
        public Task<GenerateQrResponseDto> GenerateQrAsync(Guid credentialId, Guid requestingUserId, GenerateQrRequestDto request) => throw new NotImplementedException("Not exercised by these tests.");
        public Task<List<CredentialSummaryDto>> GetMyCredentialsAsync(Guid userId) => Task.FromResult(new List<CredentialSummaryDto>());
        public Task<ResolveCredentialResponseDto> ResolveAsync(string token, Guid requestingUserId, string ipAddress) => throw new NotImplementedException("Not exercised by these tests.");
    }

    private sealed class StubCredentialActivationService : ICredentialActivationService
    {
        public Task<ActivateCredentialsResponseDto> ActivateCredentialsAsync(ActivateCredentialsRequestDto request, Guid userId, string ipAddress, CancellationToken cancellationToken) => throw new NotImplementedException("Not exercised by these tests.");
    }

    private sealed class StubIssueCredentialService : IIssueCredentialService
    {
        public CitizenCredentialStatusResponseDto? StatusToReturn { get; set; }
        public Exception? StatusException { get; set; }
        public CredentialResponseDto? IssueResultToReturn { get; set; }
        public Exception? IssueException { get; set; }

        public Task<CitizenCredentialStatusResponseDto> GetCitizenStatusAsync(string saId, Guid officialId, string ipAddress, CancellationToken cancellationToken)
        {
            if (StatusException is not null) throw StatusException;

            return Task.FromResult(StatusToReturn!);
        }

        public Task<CredentialResponseDto> IssueCredentialAsync(IssueCredentialRequestDto request, Guid officialId, string ipAddress, CancellationToken cancellationToken)
        {
            if (IssueException is not null) throw IssueException;

            return Task.FromResult(IssueResultToReturn!);
        }
    }

    private sealed class TestApiFactory : WebApplicationFactory<Program>
    {
        private readonly SqliteConnection _connection = new("DataSource=:memory:");
        private readonly IIssueCredentialService? _issueCredentialService;
        private readonly bool _useFailingExpiryService;


        public TestApiFactory(IIssueCredentialService? issueCredentialService = null, bool useFailingExpiryService = false)
        {
            _issueCredentialService = issueCredentialService;
            _useFailingExpiryService = useFailingExpiryService;
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

                services.RemoveAll(typeof(IQrService));
                services.AddScoped<IQrService, StubQrService>();

                services.RemoveAll(typeof(ICredentialActivationService));
                services.AddScoped<ICredentialActivationService, StubCredentialActivationService>();

                if (_issueCredentialService is not null)
                {
                    services.RemoveAll(typeof(IIssueCredentialService));
                    services.AddScoped(_ => _issueCredentialService);
                }

                services.RemoveAll(typeof(IHostedService));

                if (_useFailingExpiryService)
                {
                    services.RemoveAll(typeof(ICredentialExpiryService));
                    services.AddScoped<ICredentialExpiryService, StubFailingCredentialExpiryService>();
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
            if (disposing)
            {
                _connection.Dispose();
            }
        }
    }

    private sealed class StubFailingCredentialExpiryService : ICredentialExpiryService
    {
        public Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken) => Task.FromResult(false);

        public Task<CredentialExpiryCheckResponseDto> RunExpiryCheckAsync(CancellationToken cancellationToken) => Task.FromResult(new CredentialExpiryCheckResponseDto
        {
            RunDate = DateTime.UtcNow.Date,
            Status = JobRunStatus.Failed,
            ProcessedCount = 0,
            StartedAt = DateTime.UtcNow,
            CompletedAt = DateTime.UtcNow,
            ErrorMessage = "Simulated failure",
        });
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

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    [Fact]
    public async Task ExpiryCheck_AsGovernmentAdministrator_ReturnsOk()
    {
        await using var factory = new TestApiFactory();

        var db = await factory.CreateInitializedContextAsync();
        var admin = BuildUser(UserRole.GovernmentAdministrator);

        await db.DomainUsers.AddAsync(admin, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(admin));

        var response = await client.PostAsync("/api/credentials/expiry-check", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<CredentialExpiryCheckResponseDto>(JsonOptions, TestContext.Current.CancellationToken);

        Assert.NotNull(body);
        Assert.Equal(JobRunStatus.Completed, body.Status);
    }

    [Fact]
    public async Task ExpiryCheck_AsCitizen_ReturnsForbidden()
    {
        await using var factory = new TestApiFactory();

        var db = await factory.CreateInitializedContextAsync();
        var citizen = BuildUser(UserRole.Citizen);

        await db.DomainUsers.AddAsync(citizen, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(citizen));

        var response = await client.PostAsync("/api/credentials/expiry-check", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ExpiryCheck_Unauthenticated_ReturnsUnauthorized()
    {
        await using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();

        var client = factory.CreateClient();
        var response = await client.PostAsync("/api/credentials/expiry-check", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetCitizenStatus_AsOfficial_ReturnsOk()
    {
        var stub = new StubIssueCredentialService
        {
            StatusToReturn = new CitizenCredentialStatusResponseDto
            {
                SaId = "9001015800086",
                Names = "Test",
                Surname = "Test",
                Status = "Activated",
                ExistingCredentials = [],
            },
        };

        await using var factory = new TestApiFactory(stub);


        var db = await factory.CreateInitializedContextAsync();
        var official = BuildUser(UserRole.Official);

        await db.DomainUsers.AddAsync(official, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(official));

        var response = await client.GetAsync("/api/credentials/citizens/9001015800086/status", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetCitizenStatus_AsCitizen_ReturnsForbidden()
    {
        await using var factory = new TestApiFactory(new StubIssueCredentialService());

        var db = await factory.CreateInitializedContextAsync();
        var citizen = BuildUser(UserRole.Citizen);

        await db.DomainUsers.AddAsync(citizen, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(citizen));

        var response = await client.GetAsync("/api/credentials/citizens/9001015800086/status", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetCitizenStatus_CitizenNotFound_ReturnsNotFound()
    {
        var stub = new StubIssueCredentialService { StatusException = new CitizenNotFoundException("9001015800086") };
        await using var factory = new TestApiFactory(stub);

        var db = await factory.CreateInitializedContextAsync();
        var official = BuildUser(UserRole.Official);

        await db.DomainUsers.AddAsync(official, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(official));

        var response = await client.GetAsync("/api/credentials/citizens/9001015800086/status", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task IssueCredential_HappyPath_ReturnsCreated()
    {
        var stub = new StubIssueCredentialService
        {
            IssueResultToReturn = new CredentialResponseDto
            {
                Id = Guid.NewGuid(),
                Type = "DriversLicense",
                Title = "Driver's Licence",
                IssuedBy = "RMTC",
                IssueDate = DateTime.UtcNow,
                Status = "Active",
            },
        };

        await using var factory = new TestApiFactory(stub);

        var db = await factory.CreateInitializedContextAsync();
        var official = BuildUser(UserRole.Official);

        await db.DomainUsers.AddAsync(official, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(official));

        var request = new IssueCredentialRequestDto { SaId = "9001015800086", CredentialType = CredentialType.DriversLicense, ConsentGiven = true };
        var response = await client.PostAsJsonAsync("/api/credentials/issue", request, JsonOptions, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task IssueCredential_ConsentNotGiven_ReturnsBadRequest()
    {
        var stub = new StubIssueCredentialService
        {
            IssueException = new CitizenConsentRequiredException()
        };

        await using var factory = new TestApiFactory(stub);

        var db = await factory.CreateInitializedContextAsync();
        var official = BuildUser(UserRole.Official);

        await db.DomainUsers.AddAsync(official, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(official));

        var request = new IssueCredentialRequestDto { SaId = "9001015800086", CredentialType = CredentialType.DriversLicense, ConsentGiven = false };
        var response = await client.PostAsJsonAsync("/api/credentials/issue", request, JsonOptions, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task IssueCredential_AlreadyIssued_ReturnsConflict()
    {
        var stub = new StubIssueCredentialService
        {
            IssueException = new CredentialAlreadyIssuedException("9001015800086", CredentialType.DriversLicense)
        };

        await using var factory = new TestApiFactory(stub);

        var db = await factory.CreateInitializedContextAsync();
        var official = BuildUser(UserRole.Official);

        await db.DomainUsers.AddAsync(official, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(official));

        var request = new IssueCredentialRequestDto { SaId = "9001015800086", CredentialType = CredentialType.DriversLicense, ConsentGiven = true };
        var response = await client.PostAsJsonAsync("/api/credentials/issue", request, JsonOptions, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task IssueCredential_RegistryRecordNotFound_ReturnsNotFound()
    {
        var stub = new StubIssueCredentialService
        {
            IssueException = new GovernmentRegistryRecordNotFoundException("9001015800086", CredentialType.DriversLicense)
        };

        await using var factory = new TestApiFactory(stub);

        var db = await factory.CreateInitializedContextAsync();
        var official = BuildUser(UserRole.Official);

        await db.DomainUsers.AddAsync(official, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(official));

        var request = new IssueCredentialRequestDto { SaId = "9001015800086", CredentialType = CredentialType.DriversLicense, ConsentGiven = true };
        var response = await client.PostAsJsonAsync("/api/credentials/issue", request, JsonOptions, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task IssueCredential_AsCitizen_ReturnsForbidden()
    {
        await using var factory = new TestApiFactory(new StubIssueCredentialService());

        var db = await factory.CreateInitializedContextAsync();
        var citizen = BuildUser(UserRole.Citizen);

        await db.DomainUsers.AddAsync(citizen, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(citizen));

        var request = new IssueCredentialRequestDto { SaId = "9001015800086", CredentialType = CredentialType.DriversLicense, ConsentGiven = true };
        var response = await client.PostAsJsonAsync("/api/credentials/issue", request, JsonOptions, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ExpiryCheck_WhenServiceReportsFailure_ReturnsInternalServerError()
    {
        await using var factory = new TestApiFactory(useFailingExpiryService: true);

        var db = await factory.CreateInitializedContextAsync();
        var admin = BuildUser(UserRole.GovernmentAdministrator);

        await db.DomainUsers.AddAsync(admin, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(admin));

        var response = await client.PostAsync("/api/credentials/expiry-check", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<CredentialExpiryCheckResponseDto>(JsonOptions, TestContext.Current.CancellationToken);

        Assert.NotNull(body);
        Assert.Equal(JobRunStatus.Failed, body.Status);
        Assert.True(body.Failed);
    }
}
