using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
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
using System.Buffers.Text;

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

    // One key for the whole test class, so a second request from the "same phone" reuses its package.
    private static readonly OfflinePackageRequestDto DefaultDeviceKeyBody = CreateDefaultDeviceKeyBody();

    private static OfflinePackageRequestDto CreateDefaultDeviceKeyBody()
    {
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);

        return DeviceKeyBody(deviceKey);
    }

    private static Task<HttpResponseMessage> PostPackageAsync(HttpClient client, Guid credentialId) =>
        client.PostAsJsonAsync($"/api/credentials/{credentialId}/offline-package", DefaultDeviceKeyBody, JsonOptions, TestContext.Current.CancellationToken);

    private static Task<OfflinePackageResponseDto> RequestPackageAsync(HttpClient client, Guid credentialId) =>
        RequestPackageWithBodyAsync(client, credentialId, DefaultDeviceKeyBody);

    private static async Task<OfflinePackageResponseDto> RequestPackageWithBodyAsync(HttpClient client, Guid credentialId, OfflinePackageRequestDto body)
    {
        var response = await client.PostAsJsonAsync($"/api/credentials/{credentialId}/offline-package", body, JsonOptions, TestContext.Current.CancellationToken);

        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<OfflinePackageResponseDto>(JsonOptions, TestContext.Current.CancellationToken))!;
    }

    private static OfflinePackageRequestDto DeviceKeyBody(ECDsa deviceKey)
    {
        var point = deviceKey.ExportParameters(false).Q;

        return new OfflinePackageRequestDto(new DevicePublicKeyDto("EC", "P-256", Base64Url.EncodeToString(point.X), Base64Url.EncodeToString(point.Y)));
    }

    private static JsonElement PayloadOf(string issuerJwt)
    {
        using var document = JsonDocument.Parse(Base64Url.DecodeFromChars(issuerJwt.Split('.')[1]));

        return document.RootElement.Clone();
    }

    private static JsonElement JsonSegmentOf(string jws, int segment)
    {
        using var document = JsonDocument.Parse(Base64Url.DecodeFromChars(jws.Split('.')[segment]));

        return document.RootElement.Clone();
    }

    // Verifies with the published issuer key exactly as a phone would, so the test proves the list is usable offline.
    private static async Task<bool> IsSignedByTheIssuerAsync(HttpClient client, string jws)
    {
        var keys = await client.GetFromJsonAsync<IssuerKeysResponseDto>("/api/credentials/issuer-keys", JsonOptions, TestContext.Current.CancellationToken);
        var key = Assert.Single(keys!.Keys);
        using var issuerKey = ECDsa.Create(new ECParameters
        {
            Curve = ECCurve.NamedCurves.nistP256,
            Q = new ECPoint { X = Base64Url.DecodeFromChars(key.X), Y = Base64Url.DecodeFromChars(key.Y) },
        });
        var segments = jws.Split('.');

        return issuerKey.VerifyData(Encoding.ASCII.GetBytes($"{segments[0]}.{segments[1]}"), Base64Url.DecodeFromChars(segments[2]), HashAlgorithmName.SHA256);
    }

    private static async Task SetStatusAsync(AppDbContext db, Guid credentialId, CredentialStatus status)
    {
        var tracked = await db.Credentials.FirstAsync(c => c.Id == credentialId, TestContext.Current.CancellationToken);
        tracked.Status = status;
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);
    }

    private static async Task<User> SeedUserAsync(AppDbContext db, UserRole role)
    {
        var user = BuildUser(role);

        await db.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        return user;
    }

    private static OfflineVerificationEntryDto OfflineEntry(string result, int? revocationIndex) =>
        new(Guid.NewGuid(), revocationIndex, result, DateTimeOffset.UtcNow.AddMinutes(-10).ToUnixTimeSeconds());

    private static async Task<OfflineVerificationSyncResultDto> PostOfflineVerificationsAsync(HttpClient client, OfflineVerificationEntryDto entry)
    {
        var response = await client.PostAsJsonAsync("/api/credentials/offline-verifications", new OfflineVerificationBatchDto([entry]), JsonOptions, TestContext.Current.CancellationToken);
        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<OfflineVerificationSyncResultDto>(JsonOptions, TestContext.Current.CancellationToken))!;
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

        var response = await PostPackageAsync(ClientFor(factory, user), credential.Id);

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

        await PostPackageAsync(ClientFor(factory, firstUser), firstCredential.Id);
        await PostPackageAsync(ClientFor(factory, secondUser), secondCredential.Id);

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

        var response = await PostPackageAsync(ClientFor(factory, intruder), credential.Id);

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

        var response = await PostPackageAsync(ClientFor(factory, user), credential.Id);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetOfflinePackage_UnknownCredential_ReturnsNotFound()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, _) = await SeedCitizenWithLicenceAsync(db);

        var response = await PostPackageAsync(ClientFor(factory, user), Guid.NewGuid());

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

    [Fact]
    public async Task RequestOfflinePackage_WithDeviceKey_BindsTheCredentialToThatKey()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var body = DeviceKeyBody(deviceKey);

        var package = await RequestPackageWithBodyAsync(ClientFor(factory, user), credential.Id, body);

        var jwk = PayloadOf(package.IssuerSignedCredential).GetProperty("cnf").GetProperty("jwk");

        Assert.Equal("EC", jwk.GetProperty("kty").GetString());
        Assert.Equal("P-256", jwk.GetProperty("crv").GetString());
        Assert.Equal(body.DeviceKey!.X, jwk.GetProperty("x").GetString());
        Assert.Equal(body.DeviceKey.Y, jwk.GetProperty("y").GetString());
        Assert.NotNull((await ReloadAsync(db, credential.Id)).HolderKeyThumbprint);
    }

    [Fact]
    public async Task RequestOfflinePackage_WithoutADeviceKey_ReturnsBadRequestAndStoresNothing()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);

        var response = await ClientFor(factory, user).PostAsJsonAsync($"/api/credentials/{credential.Id}/offline-package", new { }, JsonOptions, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Null((await ReloadAsync(db, credential.Id)).IssuerSignedCredential);
    }

    [Fact]
    public async Task RequestOfflinePackage_BoundCredential_CannotBeDowngradedWithoutADeviceKey()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);
        var client = ClientFor(factory, user);
        await RequestPackageAsync(client, credential.Id);
        var bound = await ReloadAsync(db, credential.Id);

        var response = await client.PostAsJsonAsync($"/api/credentials/{credential.Id}/offline-package", new { }, JsonOptions, TestContext.Current.CancellationToken);

        var after = await ReloadAsync(db, credential.Id);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(bound.HolderKeyThumbprint, after.HolderKeyThumbprint);
        Assert.Equal(bound.IssuerSignedCredential, after.IssuerSignedCredential);
    }

    [Fact]
    public async Task RequestOfflinePackage_DeviceKeyMissingCoordinates_ReturnsBadRequest()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);
        using var body = new StringContent("""{ "deviceKey": { "kty": "EC", "crv": "P-256" } }""", Encoding.UTF8, "application/json");

        var response = await ClientFor(factory, user).PostAsync($"/api/credentials/{credential.Id}/offline-package", body, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Null((await ReloadAsync(db, credential.Id)).IssuerSignedCredential);
    }

    [Fact]
    public async Task RequestOfflinePackage_SameDeviceKeyTwice_ReusesThePackage()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);
        using var deviceKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var client = ClientFor(factory, user);

        var first = await RequestPackageWithBodyAsync(client, credential.Id, DeviceKeyBody(deviceKey));
        var second = await RequestPackageWithBodyAsync(client, credential.Id, DeviceKeyBody(deviceKey));

        Assert.Equal(first.IssuerSignedCredential, second.IssuerSignedCredential);
    }

    [Fact]
    public async Task RequestOfflinePackage_NewDeviceKey_MintsAgainForTheNewPhone()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);
        using var oldPhone = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        using var newPhone = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var client = ClientFor(factory, user);

        var first = await RequestPackageWithBodyAsync(client, credential.Id, DeviceKeyBody(oldPhone));
        var second = await RequestPackageWithBodyAsync(client, credential.Id, DeviceKeyBody(newPhone));

        Assert.NotEqual(first.IssuerSignedCredential, second.IssuerSignedCredential);
        Assert.Equal(
            DeviceKeyBody(newPhone).DeviceKey!.X,
            PayloadOf(second.IssuerSignedCredential).GetProperty("cnf").GetProperty("jwk").GetProperty("x").GetString());
    }

    [Theory]
    [InlineData("RSA", "P-256", 32)]
    [InlineData("EC", "P-384", 32)]
    [InlineData("EC", "P-256", 31)]
    public async Task RequestOfflinePackage_InvalidDeviceKey_ReturnsBadRequestAndStoresNothing(string kty, string crv, int coordinateBytes)
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);
        var coordinate = Base64Url.EncodeToString(new byte[coordinateBytes]);
        var body = new OfflinePackageRequestDto(new DevicePublicKeyDto(kty, crv, coordinate, coordinate));

        var response = await ClientFor(factory, user).PostAsJsonAsync($"/api/credentials/{credential.Id}/offline-package", body, JsonOptions, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Null((await ReloadAsync(db, credential.Id)).IssuerSignedCredential);
    }

    [Fact]
    public async Task RequestOfflinePackage_DeviceKeyNotOnTheCurve_ReturnsBadRequest()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, credential) = await SeedCitizenWithLicenceAsync(db);
        var coordinate = Base64Url.EncodeToString(new byte[32]);
        var body = new OfflinePackageRequestDto(new DevicePublicKeyDto("EC", "P-256", coordinate, coordinate));

        var response = await ClientFor(factory, user).PostAsJsonAsync($"/api/credentials/{credential.Id}/offline-package", body, JsonOptions, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Null((await ReloadAsync(db, credential.Id)).IssuerSignedCredential);
    }

    [Fact]
    public async Task GetRevocationList_ListsOnlyCredentialsThatCanNoLongerBeUsedOffline()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (activeUser, activeCredential) = await SeedCitizenWithLicenceAsync(db);
        var (revokedUser, revokedCredential) = await SeedCitizenWithLicenceAsync(db);
        var (_, neverMintedCredential) = await SeedCitizenWithLicenceAsync(db);

        await RequestPackageAsync(ClientFor(factory, activeUser), activeCredential.Id);
        await RequestPackageAsync(ClientFor(factory, revokedUser), revokedCredential.Id);
        await SetStatusAsync(db, revokedCredential.Id, CredentialStatus.Revoked);
        await SetStatusAsync(db, neverMintedCredential.Id, CredentialStatus.Revoked);
        var revokedIndex = (await ReloadAsync(db, revokedCredential.Id)).RevocationIndex!.Value;

        var client = ClientFor(factory, activeUser);
        var body = await client.GetFromJsonAsync<RevocationListResponseDto>("/api/credentials/revocation-list", JsonOptions, TestContext.Current.CancellationToken);

        var revoked = JsonSegmentOf(body!.RevocationList, 1).GetProperty("revoked").EnumerateArray().Select(index => index.GetInt32());

        Assert.Equal(new[] { revokedIndex }, revoked);
    }

    [Fact]
    public async Task GetRevocationList_IsSignedByTheIssuerKeyAndValidForADay()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (user, _) = await SeedCitizenWithLicenceAsync(db);
        var client = ClientFor(factory, user);

        var body = await client.GetFromJsonAsync<RevocationListResponseDto>("/api/credentials/revocation-list", JsonOptions, TestContext.Current.CancellationToken);

        var header = JsonSegmentOf(body!.RevocationList, 0);
        var payload = JsonSegmentOf(body.RevocationList, 1);

        Assert.Equal("revocation-list+jwt", header.GetProperty("typ").GetString());
        Assert.Equal(SigningKid, header.GetProperty("kid").GetString());
        Assert.Equal("urn:flashid:issuer", payload.GetProperty("iss").GetString());
        Assert.Equal(payload.GetProperty("iat").GetInt64() + 86400, payload.GetProperty("next_update").GetInt64());
        Assert.True(await IsSignedByTheIssuerAsync(client, body.RevocationList));
    }

    [Fact]
    public async Task GetRevocationList_Unauthenticated_ReturnsUnauthorized()
    {
        await using var factory = new TestApiFactory();
        await factory.CreateInitializedContextAsync();

        var response = await factory.CreateClient().GetAsync("/api/credentials/revocation-list", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RecordOfflineVerifications_VerifiedScan_WritesAnAuditRowLinkedToTheCredential()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (citizen, credential) = await SeedCitizenWithLicenceAsync(db);
        await RequestPackageAsync(ClientFor(factory, citizen), credential.Id);
        var stored = await ReloadAsync(db, credential.Id);
        var official = await SeedUserAsync(db, UserRole.Official);
        var entry = OfflineEntry("VERIFIED", stored.RevocationIndex);

        var result = await PostOfflineVerificationsAsync(ClientFor(factory, official), entry);

        var auditLog = await db.AuditLogs.AsNoTracking().FirstAsync(a => a.Id == entry.Id, TestContext.Current.CancellationToken);

        Assert.Equal(1, result.Recorded);
        Assert.Equal(AuditEventType.OfflineCredentialVerified, auditLog.EventType);
        Assert.Equal(credential.Id, auditLog.CredentialId);
        Assert.Equal(stored.CitizenId, auditLog.CitizenId);
        Assert.Equal(official.Id, auditLog.ActorId);
        Assert.Contains("device clock", auditLog.Details);
    }

    [Fact]
    public async Task RecordOfflineVerifications_SameEntryUploadedTwice_RecordsItOnce()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var official = await SeedUserAsync(db, UserRole.Official);
        var client = ClientFor(factory, official);
        var entry = OfflineEntry("STALE_PRESENTATION", null);

        await PostOfflineVerificationsAsync(client, entry);
        var retried = await PostOfflineVerificationsAsync(client, entry);

        Assert.Equal(0, retried.Recorded);
        Assert.Equal(1, retried.Duplicates);
        Assert.Equal(1, await db.AuditLogs.CountAsync(a => a.Id == entry.Id, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task RecordOfflineVerifications_FailedScan_IsRecordedButNeverLinkedToACitizen()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var (citizen, credential) = await SeedCitizenWithLicenceAsync(db);
        await RequestPackageAsync(ClientFor(factory, citizen), credential.Id);
        var stored = await ReloadAsync(db, credential.Id);
        var official = await SeedUserAsync(db, UserRole.Official);
        var entry = OfflineEntry("BAD_ISSUER_SIGNATURE", stored.RevocationIndex);

        await PostOfflineVerificationsAsync(ClientFor(factory, official), entry);

        var auditLog = await db.AuditLogs.AsNoTracking().FirstAsync(a => a.Id == entry.Id, TestContext.Current.CancellationToken);

        Assert.Equal(AuditEventType.OfflineVerificationRejected, auditLog.EventType);
        Assert.Null(auditLog.CredentialId);
        Assert.Null(auditLog.CitizenId);
    }

    [Fact]
    public async Task RecordOfflineVerifications_UnknownResult_ReturnsBadRequestAndStoresNothing()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var official = await SeedUserAsync(db, UserRole.Official);
        var entry = OfflineEntry("DEFINITELY_REAL", null);

        var response = await ClientFor(factory, official).PostAsJsonAsync("/api/credentials/offline-verifications", new OfflineVerificationBatchDto([entry]), JsonOptions, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.False(await db.AuditLogs.AnyAsync(a => a.Id == entry.Id, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task RecordOfflineVerifications_MoreThanAHundredEntries_ReturnsBadRequest()
    {
        await using var factory = new TestApiFactory();
        var db = await factory.CreateInitializedContextAsync();
        var official = await SeedUserAsync(db, UserRole.Official);
        var entries = Enumerable.Range(0, 101).Select(_ => OfflineEntry("VERIFIED", null)).ToList();

        var response = await ClientFor(factory, official).PostAsJsonAsync("/api/credentials/offline-verifications", new OfflineVerificationBatchDto(entries), JsonOptions, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
