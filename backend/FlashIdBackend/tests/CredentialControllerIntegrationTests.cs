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

        public Task<CitizenCredentialStatusResponseDto> GetCitizenStatusAsync(string saId, CancellationToken cancellationToken)
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

        public TestApiFactory(IIssueCredentialService? issueCredentialService = null)
        {
            _issueCredentialService = issueCredentialService;
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
}
