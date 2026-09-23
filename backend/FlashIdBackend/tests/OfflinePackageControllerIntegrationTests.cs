using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using Application.Common.Interfaces.ProviderInterfaces;
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
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using Application.Common.Interfaces.ServiceInterfaces;

namespace tests;

public class OfflinePackageControllerIntegrationTests
{
    private const string JwtKey = "integration-test-secret-key-which-is-long-enough"; // NOSONAR
    private const string JwtIssuer = "FlashId";
    private const string JwtAudience = "FlashIdWeb";
    private const string SigningKid = "integration-test-key";

    // Generated per run, so no private key is ever committed.
    private static readonly string SigningPrivateKey = CreateSigningKey();

    private static string CreateSigningKey()
    {
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);

        return Convert.ToBase64String(key.ExportPkcs8PrivateKey());
    }

    private static async Task<OfflinePackageResponseDto> RequestPackageAsync(HttpClient client, Guid credentialId)
    {
        var response = await client.PostAsync($"/api/credentials/{credentialId}/offline-package", null, TestContext.Current.CancellationToken);
        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<OfflinePackageResponseDto>(JsonOptions, TestContext.Current.CancellationToken))!;
    }

    // The real portrait processor runs against this, so the whole downscale path is exercised.
    private sealed class StubPhotoStorageProvider : IPhotoStorageProvider
    {
        public Task<string> GenerateReadSasUrlAsync(string blobName, TimeSpan ttl) => Task.FromResult($"https://fake-blob-sas.local/{blobName}");

        public Task<Stream?> OpenReadAsync(string blobName, CancellationToken cancellationToken)
        {
            using var image = new Image<Rgba32>(400, 500);
            var stream = new MemoryStream();

            image.SaveAsJpeg(stream);
            stream.Position = 0;

            return Task.FromResult<Stream?>(stream);
        }
    }

    // CredentialsController also resolves IQrService. Stubbed so these tests do not depend on how the
    // online QR flow signs, which is moving from Ed25519 to Key Vault ES256 (D-004).
    private sealed class StubQrService : IQrService
    {
        public Task<GenerateQrResponseDto> GenerateQrAsync(Guid credentialId, Guid requestingUserId, GenerateQrRequestDto request) => throw new NotImplementedException("Not exercised by these tests.");

        public Task<List<CredentialSummaryDto>> GetMyCredentialsAsync(Guid userId) => Task.FromResult(new List<CredentialSummaryDto>());

        public Task<ResolveCredentialResponseDto> ResolveAsync(string token, Guid requestingUserId, string ipAddress) => throw new NotImplementedException("Not exercised by these tests.");
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
                    ["Signing:Credential:Kid"] = SigningKid,
                    ["Signing:Credential:PrivateKey"] = SigningPrivateKey,
                });
            });

            builder.ConfigureServices(services =>
            {
                _connection.Open();

                services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));

                services.RemoveAll(typeof(IPhotoStorageProvider));
                services.AddSingleton<IPhotoStorageProvider, StubPhotoStorageProvider>();

                services.RemoveAll(typeof(IHostedService));

                services.RemoveAll(typeof(IQrService));
                services.AddScoped<IQrService, StubQrService>();
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

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

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

    private static Credential BuildLicenceFor(Citizen citizen)
    {
        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Status = CredentialStatus.Active,
            IssuedBy = "Integration Test",
            IssueDate = DateTime.UtcNow.AddYears(-1),
            Signature = "signature.png",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow.AddDays(-30),
        };

        credential.DriversLicense = new DriversLicense
        {
            Id = Guid.NewGuid(),
            CredentialId = credential.Id,
            LicenseNumber = "FAKE-1234",
            LicenseCode = LicenseCode.B,
            Restrictions = "0",
            ExpiryDate = DateTime.UtcNow.AddYears(3),
            PhotoPath = "license-photo.jpg",
            CountryOfIssue = "South Africa",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        return credential;
    }

    private static Citizen BuildCitizenFor(User user) => new()
    {
        Id = Guid.NewGuid(),
        UserId = user.Id,
        SaId = $"00000000{Random.Shared.Next(10000, 99999)}",
        Names = "Thabo",
        Surname = "Mokoena",
        DateOfBirth = new DateTime(1998, 3, 14, 0, 0, 0, DateTimeKind.Utc),
        Gender = Gender.Male,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
    };

    private static async Task<(User User, Credential Credential)> SeedCitizenWithLicenceAsync(AppDbContext db)
    {
        var user = BuildUser(UserRole.Citizen);
        var citizen = BuildCitizenFor(user);
        var credential = BuildLicenceFor(citizen);

        await db.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await db.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
        await db.Credentials.AddAsync(credential, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        return (user, credential);
    }

    private static HttpClient ClientFor(TestApiFactory factory, User user)
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GenerateTokenFor(user));

        return client;
    }

    private static async Task<Credential> ReloadAsync(AppDbContext db, Guid credentialId) =>
        await db.Credentials.AsNoTracking().FirstAsync(c => c.Id == credentialId, TestContext.Current.CancellationToken);

    [Fact]
    public async Task GetOfflinePackage_AsTheOwner_ReturnsThePackageAndStoresIt()
    {
        using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);

        var response = await ClientFor(factory, user).PostAsync($"/api/credentials/{credential.Id}/offline-package", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<OfflinePackageResponseDto>(JsonOptions, TestContext.Current.CancellationToken);

        Assert.NotNull(body);
        Assert.Equal(3, body.IssuerSignedCredential.Split('.').Length);
        Assert.Contains("portrait", body.Disclosures.Keys);
        Assert.DoesNotContain("signature_image", body.Disclosures.Keys);

        var stored = await ReloadAsync(db, credential.Id);

        Assert.Equal(1, stored.RevocationIndex);
        Assert.Equal(SigningKid, stored.SigningKid);
        Assert.NotNull(stored.SignedAt);
        Assert.NotNull(stored.PackageExpiresAt);
    }

    [Fact]
    public async Task GetOfflinePackage_RequestedTwice_ReusesTheStoredPackage()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);
        var client = ClientFor(factory, user);

        var first = await RequestPackageAsync(client, credential.Id);
        var second = await RequestPackageAsync(client, credential.Id);

        Assert.NotNull(first);
        Assert.NotNull(second);
        Assert.Equal(first.IssuerSignedCredential, second.IssuerSignedCredential);
        Assert.Equal(first.SignedAt, second.SignedAt);
    }

    [Fact]
    public async Task GetOfflinePackage_StoredPackageBoundToAnotherDevice_MintsAgain()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);
        var client = ClientFor(factory, user);

        var first = await RequestPackageAsync(client, credential.Id);

        var tracked = await db.Credentials.FirstAsync(c => c.Id == credential.Id, TestContext.Current.CancellationToken);
        tracked.HolderKeyThumbprint = "a-different-phone";
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var second = await RequestPackageAsync(client, credential.Id);

        Assert.NotNull(first);
        Assert.NotNull(second);
        Assert.NotEqual(first.IssuerSignedCredential, second.IssuerSignedCredential);
    }

    [Fact]
    public async Task GetOfflinePackage_TwoCredentials_ReceiveDistinctRevocationIndexes()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (firstUser, firstCredential) = await SeedCitizenWithLicenceAsync(db);
        var (secondUser, secondCredential) = await SeedCitizenWithLicenceAsync(db);

        await ClientFor(factory, firstUser).PostAsync($"/api/credentials/{firstCredential.Id}/offline-package", null, TestContext.Current.CancellationToken);
        await ClientFor(factory, secondUser).PostAsync($"/api/credentials/{secondCredential.Id}/offline-package", null, TestContext.Current.CancellationToken);

        var first = await ReloadAsync(db, firstCredential.Id);
        var second = await ReloadAsync(db, secondCredential.Id);

        Assert.Equal(1, first.RevocationIndex);
        Assert.Equal(2, second.RevocationIndex);
    }

    [Fact]
    public async Task GetOfflinePackage_AsAnotherCitizen_ReturnsForbidden()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (_, credential) = await SeedCitizenWithLicenceAsync(db);
        var (intruder, _) = await SeedCitizenWithLicenceAsync(db);

        var response = await ClientFor(factory, intruder).PostAsync($"/api/credentials/{credential.Id}/offline-package", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        var stored = await ReloadAsync(db, credential.Id);

        Assert.Null(stored.IssuerSignedCredential);
    }

    [Fact]
    public async Task GetOfflinePackage_InactiveCredential_ReturnsBadRequest()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);

        var tracked = await db.Credentials.FirstAsync(c => c.Id == credential.Id, TestContext.Current.CancellationToken);
        tracked.Status = CredentialStatus.Revoked;
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var response = await ClientFor(factory, user).PostAsync($"/api/credentials/{credential.Id}/offline-package", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetOfflinePackage_UnknownCredential_ReturnsNotFound()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, _) = await SeedCitizenWithLicenceAsync(db);

        var response = await ClientFor(factory, user).PostAsync($"/api/credentials/{Guid.NewGuid()}/offline-package", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetOfflinePackage_Unauthenticated_ReturnsUnauthorized()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (_, credential) = await SeedCitizenWithLicenceAsync(db);

        var response = await factory.CreateClient().PostAsync($"/api/credentials/{credential.Id}/offline-package", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetIssuerKeys_Authenticated_ReturnsTheActiveKey()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, _) = await SeedCitizenWithLicenceAsync(db);

        var body = await ClientFor(factory, user).GetFromJsonAsync<IssuerKeysResponseDto>("/api/credentials/issuer-keys", JsonOptions, TestContext.Current.CancellationToken);

        Assert.NotNull(body);

        var key = Assert.Single(body.Keys);

        Assert.Equal(SigningKid, key.Kid);
        Assert.Equal("EC", key.Kty);
        Assert.Equal("P-256", key.Crv);
        Assert.Equal("active", key.Status);
        Assert.InRange(body.RetrievedAt, DateTimeOffset.UtcNow.AddMinutes(-1), DateTimeOffset.UtcNow.AddMinutes(1));
    }

    [Fact]
    public async Task GetIssuerKeys_AsOfficial_ReturnsTheActiveKey()
    {

        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var official = BuildUser(UserRole.Official);

        await db.DomainUsers.AddAsync(official, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var body = await ClientFor(factory, official).GetFromJsonAsync<IssuerKeysResponseDto>("/api/credentials/issuer-keys", JsonOptions, TestContext.Current.CancellationToken);

        Assert.Equal(SigningKid, Assert.Single(body!.Keys).Kid);
    }

    [Fact]
    public async Task RequestOfflinePackage_MalformedCredentialId_ReturnsNotFound()
    {

        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, _) = await SeedCitizenWithLicenceAsync(db);

        var response = await ClientFor(factory, user).PostAsync("/api/credentials/not-a-guid/offline-package", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
