using System.Security.Cryptography;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;
using Application.Features.Emergency.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using CosmosClient = Microsoft.Azure.Cosmos.CosmosClient;
using Container = Microsoft.Azure.Cosmos.Container;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;

namespace tests;

public class EmergencyRevocationIntegrationTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _context;

    public EmergencyRevocationIntegrationTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        _context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options);
        _context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
        GC.SuppressFinalize(this);
    }

    private EmergencyRepository EmergencyRepository()
    {
        var cosmos = new Mock<CosmosClient>();
        cosmos.Setup(c => c.GetContainer(It.IsAny<string>(), It.IsAny<string>())).Returns(Mock.Of<Container>());

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Cosmos:DatabaseName"] = "test",
                ["Cosmos:ContainerName"] = "test",
            })
            .Build();

        return new EmergencyRepository(_context, cosmos.Object, config);
    }

    private (User User, Citizen Citizen) SeedCitizen(string saId)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = $"{saId}@example.com",
            PhoneNumber = "0821234567",
            PasswordHash = "hash",
            PasswordSet = true,
            IsEmailVerified = true,
            Role = UserRole.Citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = saId,
            Names = "Thandiwe",
            Surname = "Dlamini",
            DateOfBirth = new DateTime(1990, 4, 12, 0, 0, 0, DateTimeKind.Utc),
            Status = CitizenStatus.Activated,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.DomainUsers.Add(user);
        _context.Citizens.Add(citizen);
        return (user, citizen);
    }

    private EmergencyProfile SeedProfile(Citizen citizen, bool isEnabled, int? revocationIndex)
    {
        var profile = new EmergencyProfile
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            IsEnabled = isEnabled,
            ConsentGivenAt = isEnabled ? DateTime.UtcNow : null,
            RevocationIndex = revocationIndex,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.EmergencyProfiles.Add(profile);
        return profile;
    }

    private Task<IReadOnlyList<int>> RevokedIndexes() =>
        new OfflinePackageRepository(_context).GetRevokedIndexesAsync(CancellationToken.None);

    [Fact]
    public async Task RevocationList_IncludesADisabledProfilesIndex_ButNotAnEnabledOne()
    {
        var (_, disabledCitizen) = SeedCitizen("9001010000001");
        var (_, enabledCitizen) = SeedCitizen("9001010000002");
        SeedProfile(disabledCitizen, isEnabled: false, revocationIndex: EmergencyClaimNames.RevocationIndexOffset);
        SeedProfile(enabledCitizen, isEnabled: true, revocationIndex: EmergencyClaimNames.RevocationIndexOffset + 1);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var revoked = await RevokedIndexes();

        Assert.Contains(EmergencyClaimNames.RevocationIndexOffset, revoked);
        Assert.DoesNotContain(EmergencyClaimNames.RevocationIndexOffset + 1, revoked);
    }

    [Fact]
    public async Task RevocationList_IncludesTheOldIndex_AfterThePhoneIsReRegistered()
    {
        var (user, citizen) = SeedCitizen("9001010000003");
        var profile = SeedProfile(citizen, isEnabled: true, revocationIndex: EmergencyClaimNames.RevocationIndexOffset + 4);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var credentials = new Mock<ICredentialRepository>();
        credentials.Setup(c => c.GetCitizenByUserIdAsync(user.Id)).ReturnsAsync(citizen);

        var service = new EmergencyService(
            EmergencyRepository(),
            credentials.Object,
            Mock.Of<IInstitutionRepository>(),
            Mock.Of<IPhotoStorageProvider>(),
            Mock.Of<ISdJwtCredentialFactory>(),
            Mock.Of<IEmergencyNotifier>(),
            Mock.Of<IFieldCryptoProvider>());

        using var newPhone = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        await service.RegisterDeviceAsync(
            new RegisterEmergencyDeviceRequestDto
            {
                PublicKeySpki = EmergencyBase64Url.Encode(newPhone.ExportSubjectPublicKeyInfo()),
                Platform = "android",
            },
            user.Id, CancellationToken.None);

        Assert.Contains(EmergencyClaimNames.RevocationIndexOffset + 4, await RevokedIndexes());
        Assert.Null((await _context.EmergencyProfiles.SingleAsync(p => p.Id == profile.Id, TestContext.Current.CancellationToken)).RevocationIndex);
    }

    [Fact]
    public async Task EmergencyIndexes_NeverFallInTheCredentialRange()
    {
        var (_, citizen) = SeedCitizen("9001010000004");
        _context.Credentials.Add(new Credential
        {
            Id = Guid.NewGuid(),
            Status = CredentialStatus.Active,
            Signature = "sig",
            IssuedBy = "Home Affairs",
            IssueDate = DateTime.UtcNow.AddYears(-1),
            CitizenId = citizen.Id,
            RevocationIndex = 5,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        });
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var emergency = EmergencyRepository();
        var first = await emergency.NextRevocationIndexAsync(CancellationToken.None);

        SeedProfile(citizen, isEnabled: true, revocationIndex: first);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var second = await emergency.NextRevocationIndexAsync(CancellationToken.None);
        var nextCredential = await new OfflinePackageRepository(_context).NextRevocationIndexAsync(CancellationToken.None);

        Assert.Equal(EmergencyClaimNames.RevocationIndexOffset, first);
        Assert.Equal(EmergencyClaimNames.RevocationIndexOffset + 1, second);
        Assert.Equal(6, nextCredential);
    }

    [Fact]
    public async Task NextRevocationIndex_NeverReusesARetiredIndex()
    {
        _context.RetiredEmergencyRevocationIndexes.Add(new RetiredEmergencyRevocationIndex
        {
            Id = Guid.NewGuid(),
            RevocationIndex = EmergencyClaimNames.RevocationIndexOffset + 20,
            EmergencyProfileId = Guid.NewGuid(),
            RetiredAt = DateTime.UtcNow,
        });
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var next = await EmergencyRepository().NextRevocationIndexAsync(CancellationToken.None);

        Assert.Equal(EmergencyClaimNames.RevocationIndexOffset + 21, next);
    }

    [Fact]
    public async Task TrySaveChanges_TwoProfilesWithTheSameIndex_ReportsTheCollision()
    {
        var (_, first) = SeedCitizen("9001010000005");
        var (_, second) = SeedCitizen("9001010000006");
        SeedProfile(first, isEnabled: true, revocationIndex: EmergencyClaimNames.RevocationIndexOffset);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        SeedProfile(second, isEnabled: true, revocationIndex: EmergencyClaimNames.RevocationIndexOffset);

        Assert.False(await EmergencyRepository().TrySaveChangesAsync(CancellationToken.None));
    }

    [Fact]
    public async Task GetProfileByRevocationIndex_FindsTheProfileThroughARetiredIndex()
    {
        var (_, citizen) = SeedCitizen("9001010000007");
        var profile = SeedProfile(citizen, isEnabled: true, revocationIndex: EmergencyClaimNames.RevocationIndexOffset + 30);
        _context.RetiredEmergencyRevocationIndexes.Add(new RetiredEmergencyRevocationIndex
        {
            Id = Guid.NewGuid(),
            RevocationIndex = EmergencyClaimNames.RevocationIndexOffset + 12,
            EmergencyProfileId = profile.Id,
            RetiredAt = DateTime.UtcNow,
        });
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var repository = EmergencyRepository();

        Assert.Equal(profile.Id, (await repository.GetProfileByRevocationIndexAsync(EmergencyClaimNames.RevocationIndexOffset + 12, CancellationToken.None))?.Id);
        Assert.Equal(profile.Id, (await repository.GetProfileByRevocationIndexAsync(EmergencyClaimNames.RevocationIndexOffset + 30, CancellationToken.None))?.Id);
        Assert.Null(await repository.GetProfileByRevocationIndexAsync(7, CancellationToken.None));
    }
}
