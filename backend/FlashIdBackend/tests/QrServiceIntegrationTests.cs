using Application.Common.Services;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Providers;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.Sqlite;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;

namespace tests;

public class QrServiceIntegrationTests
{
    private const string FullNameField = "Full name";
    private const string SaIdNumberField = "SA ID number";
    private const string PhotoField = "Photo";
    private const string LicenseNumberField = "License number";
    private const string LicenseCodeField = "License code";
    private const string ExpiryDateField = "Expiry date";
    private const string CountryOfIssueField = "Country of issue";
    private const string DateOfBirthField = "Date of birth";
    private const string HomeAffairsIssuer = "Home Affairs";
    private const string LocalHostIp = "127.0.0.1";

    private sealed class FakePhotoStorageProvider : IPhotoStorageProvider
    {
        public Task<string> GenerateReadSasUrlAsync(string blobName, TimeSpan ttl) => Task.FromResult($"https://fake-blob-sas.local/{blobName}");
    }

    private sealed class FakeQrDisclosureTokenRepository : IQrDisclosureTokenRepository
    {
        public List<QrDisclosureToken> Tokens { get; } = new();

        public Task AddAsync(QrDisclosureToken token)
        {
            Tokens.Add(token);
            return Task.CompletedTask;
        }

        public Task<bool> TryMarkUsedAsync(Guid jti)
        {
            var token = Tokens.FirstOrDefault(q => q.Jti == jti && q.UsedAt == null);

            if (token == null) return Task.FromResult(false);

            token.UsedAt = DateTime.UtcNow;

            return Task.FromResult(true);
        }

        public Task InvalidateActiveTokensForCredentialAsync(Guid credentialId)
        {
            foreach (var token in Tokens.Where(n => n.CredentialId == credentialId && n.UsedAt == null && n.ExpiresAt > DateTime.UtcNow))
            {
                token.UsedAt = DateTime.UtcNow;
            }

            return Task.CompletedTask;
        }
    }

    private static AppDbContext CreateContext()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    private static IConfiguration CreateQrConfiguration()
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    // NOSONAR: not a real secret
                    ["Qr:Ed25519PrivateKey"] = "8O/E1cl/UPWEcxPaC6NvN2GSh1ged35YBOP8ACZf0K0=",
                }
            )
            .Build();
    }

    private static QrService CreateQrService(AppDbContext context)
    {
        var (service, _) = CreateQrServiceWithTokenRepo(context);

        return service;
    }

    private static (QrService, FakeQrDisclosureTokenRepository TokenRepo) CreateQrServiceWithTokenRepo(AppDbContext context)
    {
        var credentialRepository = new CredentialRepository(context);
        var qrDisclosureTokenRepository = new FakeQrDisclosureTokenRepository();
        var configuration = CreateQrConfiguration();
        var signingProvider = new Ed25519SigningProvider(configuration);
        var institutionRepository = new InstitutionRepository(context);
        var disclosedFieldValueResolver = new DisclosedFieldValueResolver(new FakePhotoStorageProvider());
        var service = new QrService(credentialRepository, signingProvider, qrDisclosureTokenRepository, institutionRepository, disclosedFieldValueResolver);

        return (service, qrDisclosureTokenRepository);
    }

    private static (User User, Citizen Citizen) CreateCitizenWithUser()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "thandiwe.mokoena@example.com",
            PhoneNumber = "0821234567",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPwd123!"), // NOSONAR - test-only dummy credential
            PasswordSet = true,
            IsDeleted = false,
            IsEmailVerified = true,
            Role = UserRole.Citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = "9001015800083",
            Names = "Thandiwe",
            Surname = "Mokoena",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Status = CitizenStatus.Activated,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        return (user, citizen);
    }

    private static Credential BuildCredential(Citizen c, CredentialStatus cs = CredentialStatus.Active) => new()
    {
        Id = Guid.NewGuid(),
        Status = cs,
        Signature = string.Empty,
        IssuedBy = HomeAffairsIssuer,
        IssueDate = DateTime.UtcNow,
        CitizenId = c.Id,
        Citizen = c,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
    };

    private static async Task SeedAsync(AppDbContext adc, User u, Citizen c, params Credential[] cred)
    {
        await adc.DomainUsers.AddAsync(u, TestContext.Current.CancellationToken);
        await adc.Citizens.AddAsync(c, TestContext.Current.CancellationToken);
        await adc.Credentials.AddRangeAsync(cred, TestContext.Current.CancellationToken);
        await adc.SaveChangesAsync(TestContext.Current.CancellationToken);
    }

    private static async Task<(User User, Citizen Citizen, Credential Credential)> SeedCredentialAsync(AppDbContext adc, CredentialStatus cs = CredentialStatus.Active)
    {
        var (u, c) = CreateCitizenWithUser();
        var cred = BuildCredential(c, cs);
        await SeedAsync(adc, u, c, cred);
        return (u, c, cred);
    }

    private static GenerateQrRequestDto FullDisclosureRequest() => new()
    {
        DisclosedFields = new List<string>
        {
            FullNameField, SaIdNumberField, PhotoField, LicenseNumberField,
            LicenseCodeField, ExpiryDateField, CountryOfIssueField,DateOfBirthField,
        },
    };

    [Fact]
    public async Task GenerateQrAsync_ActiveCredentialOwnedByUser_ReturnsValidSignedToken()
    {
        using var context = CreateContext();
        var service = CreateQrService(context);
        var (user, _, cred) = await SeedCredentialAsync(context);


        var request = FullDisclosureRequest();
        var result = await service.GenerateQrAsync(cred.Id, user.Id, request);

        Assert.NotNull(result);
        Assert.NotEmpty(result.Token);
        Assert.True(result.ExpiresAt > DateTime.UtcNow);
        Assert.True(result.ExpiresAt <= DateTime.UtcNow.AddSeconds(61));
    }

    [Fact]
    public async Task GenerateQrAsync_PersistsToken_ThatCanOnlyBeClaimedOnce()
    {
        using var context = CreateContext();
        var (service, tokenRepo) = CreateQrServiceWithTokenRepo(context);
        var (user, _, cred) = await SeedCredentialAsync(context);

        var request = FullDisclosureRequest();
        await service.GenerateQrAsync(cred.Id, user.Id, request);

        var persistedToken = Assert.Single(tokenRepo.Tokens);
        Assert.Null(persistedToken.UsedAt);

        var firstClaim = await tokenRepo.TryMarkUsedAsync(persistedToken.Jti);
        var secondClaim = await tokenRepo.TryMarkUsedAsync(persistedToken.Jti);

        Assert.True(firstClaim);
        Assert.False(secondClaim);
    }

    [Fact]
    public async Task GenerateQrAsync_RevokedCredential_ThrowsCredentialNotActiveException()
    {
        using var context = CreateContext();
        var service = CreateQrService(context);
        var (user, _, cred) = await SeedCredentialAsync(context, CredentialStatus.Revoked);

        var request = new GenerateQrRequestDto { DisclosedFields = new List<string>() };

        await Assert.ThrowsAsync<CredentialNotActiveException>(
            () => service.GenerateQrAsync(cred.Id, user.Id, request));
    }

    [Fact]
    public async Task GenerateQrAsync_MissingMandatoryField_ThrowsInvalidDisclosedFieldsException()
    {
        using var context = CreateContext();
        var service = CreateQrService(context);
        var (user, _, cred) = await SeedCredentialAsync(context);

        var request = new GenerateQrRequestDto { DisclosedFields = new List<string> { FullNameField } };
        await Assert.ThrowsAsync<InvalidDisclosedFieldsException>(() => service.GenerateQrAsync(cred.Id, user.Id, request));
    }

    [Fact]
    public async Task GetMyCredentialsAsync_ReturnsOnlyActiveCredentialsForThatUser()
    {
        using var context = CreateContext();
        var service = CreateQrService(context);
        var (user, citizen) = CreateCitizenWithUser();

        var activeCredential = BuildCredential(citizen, CredentialStatus.Active);
        var expiredCredential = BuildCredential(citizen, CredentialStatus.Expired);

        await SeedAsync(context, user, citizen, activeCredential, expiredCredential);

        var result = await service.GetMyCredentialsAsync(user.Id);

        Assert.Single(result);
        Assert.Equal(activeCredential.Id, result[0].Id);
    }

    [Fact]
    public async Task ResolveAsync_ValidToken_ReturnsDisclosedValuesAndMarksTokenAsUsed()
    {
        using var context = CreateContext();
        var (service, tokenRepo) = CreateQrServiceWithTokenRepo(context);
        var (user, _, cred) = await SeedCredentialAsync(context);

        var driversL = new DriversLicense
        {
            Id = Guid.NewGuid(),
            LicenseNumber = "4589161234567",
            LicenseCode = LicenseCode.C,
            Restrictions = "01",
            ExpiryDate = new DateTime(2030, 01, 01, 0, 0, 0, DateTimeKind.Utc),
            PhotoPath = "drivers-license-photo.jpg",
            CountryOfIssue = "South Africa",
            CredentialId = cred.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await context.DriversLicenses.AddAsync(driversL, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var req = FullDisclosureRequest();

        var generated = await service.GenerateQrAsync(cred.Id, user.Id, req);
        var res = await service.ResolveAsync(generated.Token, user.Id, LocalHostIp);

        Assert.Equal("Driver's License", res.CredentialType);
        Assert.Equal("Thandiwe Mokoena", res.DisclosedFields[FullNameField]);
        Assert.Equal("9001015800083", res.DisclosedFields[SaIdNumberField]);
        Assert.Equal("4589161234567", res.DisclosedFields[LicenseNumberField]);
        Assert.Equal("South Africa", res.DisclosedFields[CountryOfIssueField]);

        var persistedToken = Assert.Single(tokenRepo.Tokens);
        Assert.NotNull(persistedToken.UsedAt);

        var auditlog = await context.AuditLogs.SingleAsync(TestContext.Current.CancellationToken);
        Assert.Equal(AuditEventType.CredentialVerified, auditlog.EventType);
        Assert.Equal(user.Id, auditlog.ActorId);
        Assert.Equal(cred.Id, auditlog.CredentialId);
    }

    [Fact]
    public async Task ResolveAlreadyUsed_TokenAlreadyUsed_ThrowsInvalidDisclosureTokenException()
    {
        using var context = CreateContext();
        var service = CreateQrService(context);
        var (user, _, cred) = await SeedCredentialAsync(context);

        var req = FullDisclosureRequest();
        var generated = await service.GenerateQrAsync(cred.Id, user.Id, req);

        await service.ResolveAsync(generated.Token, user.Id, LocalHostIp);
        await Assert.ThrowsAsync<InvalidDisclosureTokenException>(() => service.ResolveAsync(generated.Token, user.Id, LocalHostIp));
    }

    [Fact]
    public async Task ResolveAsync_MalformedToken_ThrowsInvalidDisclosureTokenException()
    {
        using var context = CreateContext();
        var service = CreateQrService(context);
        var (user, citizen) = CreateCitizenWithUser();
        await SeedAsync(context, user, citizen);

        await Assert.ThrowsAsync<InvalidDisclosureTokenException>(
            () => service.ResolveAsync("not-a-valid-base64!", user.Id, LocalHostIp));
    }

    [Fact]
    public async Task ResolveAsync_CredentialRevokedAfterGeneration_ThrowsInvalidDisclosureTokenException()
    {
        using var context = CreateContext();
        var service = CreateQrService(context);
        var (user, _, cred) = await SeedCredentialAsync(context);

        var req = FullDisclosureRequest();
        var generated = await service.GenerateQrAsync(cred.Id, user.Id, req);

        cred.Status = CredentialStatus.Revoked;
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        await Assert.ThrowsAsync<InvalidDisclosureTokenException>(() => service.ResolveAsync(generated.Token, user.Id, LocalHostIp));
    }
}