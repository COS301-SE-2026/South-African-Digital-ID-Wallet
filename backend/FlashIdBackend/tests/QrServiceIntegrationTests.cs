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

namespace tests;

public class QrServiceIntegrationTests
{
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
                    // NOSONAR - test-only dummy key, not a real secret
                    ["Qr:Ed25519PrivateKey"] = "8O/E1cl/UPWEcxPaC6NvN2GSh1ged35YBOP8ACZf0K0=",
                }
            )
            .Build();
    }

    private static QrService CreateQrService(AppDbContext context)
    {
        var credentialRepository = new CredentialRepository(context);
        var qrDisclosureTokenRepository = new QrDisclosureTokenRepository(context);
        var configuration = CreateQrConfiguration();
        var signingProvider = new Ed25519SigningProvider(configuration);
        var institutionRepository = new InstitutionRepository(context);

        return new QrService(credentialRepository, signingProvider, qrDisclosureTokenRepository, institutionRepository);
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
            DateOfBirth = new DateTime(1990, 1, 1),
            Status = CitizenStatus.Activated,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        return (user, citizen);
    }

    [Fact]
    public async Task GenerateQrAsync_ActiveCredentialOwnedByUser_ReturnsValidSignedToken()
    {
        using var context = CreateContext();
        var service = CreateQrService(context);
        var (user, citizen) = CreateCitizenWithUser();

        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            Status = CredentialStatus.Active,
            Signature = string.Empty,
            IssuedBy = "Home Affairs",
            IssueDate = DateTime.UtcNow,
            CitizenId = citizen.Id,
            Citizen = citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await context.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.Credentials.AddAsync(credential, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new GenerateQrRequestDto
        {
            DisclosedFields = new List<string>
          {
        "Full name", "SA ID number", "Photo", "License number",
        "License code", "Expiry date", "Country of issue",
          },
        };
        var result = await service.GenerateQrAsync(credential.Id, user.Id, request);

        Assert.NotNull(result);
        Assert.NotEmpty(result.Token);
        Assert.True(result.ExpiresAt > DateTime.UtcNow);
        Assert.True(result.ExpiresAt <= DateTime.UtcNow.AddSeconds(61));
    }

    [Fact]
    public async Task GenerateQrAsync_PersistsToken_ThatCanOnlyBeClaimedOnce()
    {
        using var context = CreateContext();
        var qrDisclosureTokenRepository = new QrDisclosureTokenRepository(context);
        var service = CreateQrService(context);
        var (user, citizen) = CreateCitizenWithUser();

        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            Status = CredentialStatus.Active,
            Signature = string.Empty,
            IssuedBy = "Home Affairs",
            IssueDate = DateTime.UtcNow,
            CitizenId = citizen.Id,
            Citizen = citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await context.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.Credentials.AddAsync(credential, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new GenerateQrRequestDto
        {
            DisclosedFields = new List<string>
            {
                "Full name", "SA ID number", "Photo", "License number", "License code", "Expiry date",
                "Country of issue",
            }
        };
        await service.GenerateQrAsync(credential.Id, user.Id, request);

        var persistedToken = await context.QrDisclosureTokens.SingleAsync(TestContext.Current.CancellationToken);
        Assert.Null(persistedToken.UsedAt);

        var firstClaim = await qrDisclosureTokenRepository.TryMarkUsedAsync(persistedToken.Jti);
        var secondClaim = await qrDisclosureTokenRepository.TryMarkUsedAsync(persistedToken.Jti);

        Assert.True(firstClaim);
        Assert.False(secondClaim);
    }

    [Fact]
    public async Task GenerateQrAsync_RevokedCredential_ThrowsCredentialNotActiveException()
    {
        using var context = CreateContext();
        var service = CreateQrService(context);
        var (user, citizen) = CreateCitizenWithUser();

        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            Status = CredentialStatus.Revoked,
            Signature = string.Empty,
            IssuedBy = "Home Affairs",
            IssueDate = DateTime.UtcNow,
            CitizenId = citizen.Id,
            Citizen = citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await context.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.Credentials.AddAsync(credential, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new GenerateQrRequestDto { DisclosedFields = new List<string>() };

        await Assert.ThrowsAsync<CredentialNotActiveException>(
            () => service.GenerateQrAsync(credential.Id, user.Id, request));
    }

    [Fact]
    public async Task GenerateQrAsync_MissingMandatoryField_ThrowsInvalidDisclosedFieldsException()
    {
        using var context = CreateContext();
        var service = CreateQrService(context);
        var (user, citizen) = CreateCitizenWithUser();

        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            Status = CredentialStatus.Active,
            Signature = string.Empty,
            IssuedBy = "Home Affairs",
            IssueDate = DateTime.UtcNow,
            CitizenId = citizen.Id,
            Citizen = citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await context.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.Credentials.AddAsync(credential, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new GenerateQrRequestDto { DisclosedFields = new List<string> { "Full name" } };

        await Assert.ThrowsAsync<InvalidDisclosedFieldsException>(() => service.GenerateQrAsync(credential.Id, user.Id, request));
    }

    [Fact]
    public async Task GetMyCredentialsAsync_ReturnsOnlyActiveCredentialsForThatUser()
    {
        using var context = CreateContext();
        var service = CreateQrService(context);
        var (user, citizen) = CreateCitizenWithUser();

        var activeCredential = new Credential
        {
            Id = Guid.NewGuid(),
            Status = CredentialStatus.Active,
            Signature = string.Empty,
            IssuedBy = "Home Affairs",
            IssueDate = DateTime.UtcNow,
            CitizenId = citizen.Id,
            Citizen = citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var expiredCredential = new Credential
        {
            Id = Guid.NewGuid(),
            Status = CredentialStatus.Expired,
            Signature = string.Empty,
            IssuedBy = "Home Affairs",
            IssueDate = DateTime.UtcNow,
            CitizenId = citizen.Id,
            Citizen = citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await context.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.Credentials.AddRangeAsync(
            new[] { activeCredential, expiredCredential }, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await service.GetMyCredentialsAsync(user.Id);

        Assert.Single(result);
        Assert.Equal(activeCredential.Id, result[0].Id);
    }
}