using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class CredentialsActivationRepositoryIntegrationTests
{
    private const string KnownSaId = "9001015800086";

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

    private static async Task<Citizen> SeedCitizenAsync(AppDbContext context)
    {
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = KnownSaId,
            Names = "Test",
            Surname = "Test",
            Status = CitizenStatus.Activated,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await context.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        return citizen;
    }

    private static Credential BuildDriversLicenseCredential(Guid citizenId, string licenseNumber) => new()
    {
        Id = Guid.NewGuid(),
        Status = CredentialStatus.Active,
        Signature = "sig",
        IssuedBy = "Licensing Dept Durban",
        IssueDate = DateTime.UtcNow,
        CitizenId = citizenId,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
        DriversLicense = new DriversLicense
        {
            Id = Guid.NewGuid(),
            CitizenId = citizenId,
            LicenseNumber = licenseNumber,
            LicenseCode = LicenseCode.EB,
            Restrictions = "None",
            ExpiryDate = DateTime.UtcNow.AddYears(5),
            PhotoPath = "photo.png",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        },
    };

    private static Credential BuildIdentityDocumentCredential(Guid citizenId) => new()
    {
        Id = Guid.NewGuid(),
        Status = CredentialStatus.Active,
        Signature = "sig",
        IssuedBy = "Home Affairs Durban",
        IssueDate = DateTime.UtcNow,
        CitizenId = citizenId,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
        IdentityDocument = new IdentityDocument
        {
            Id = Guid.NewGuid(),
            CitizenId = citizenId,
            Citizenship = "South Africa",
            CountryOfBirth = "South Africa",
            Nationality = "South African",
            Status = IdentityDocumentStatus.Citizen,
            PhotoPath = "photo.png",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        },
    };

    [Fact]
    public async Task AddCredential_SecondDriversLicenseForSameCitizen_ViolatesUniqueIndex()
    {
        using var context = CreateContext();
        var citizen = await SeedCitizenAsync(context);
        var repo = new CredentialsActivationRepository(context);

        await repo.AddCredentialAsync(BuildDriversLicenseCredential(citizen.Id, "DL0000001"), TestContext.Current.CancellationToken);
        await repo.SaveChangesAsync(TestContext.Current.CancellationToken);
        await repo.AddCredentialAsync(BuildDriversLicenseCredential(citizen.Id, "DL0000002"), TestContext.Current.CancellationToken);
        await Assert.ThrowsAsync<DbUpdateException>(() => repo.SaveChangesAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task AddCredential_DriversLicenseAndIdentityDocumentForSameCitizen_BothSucceed()
    {
        using var context = CreateContext();
        var citizen = await SeedCitizenAsync(context);
        var repo = new CredentialsActivationRepository(context);

        await repo.AddCredentialAsync(BuildDriversLicenseCredential(citizen.Id, "DL0000001"), TestContext.Current.CancellationToken);
        await repo.AddCredentialAsync(BuildIdentityDocumentCredential(citizen.Id), TestContext.Current.CancellationToken);
        await repo.SaveChangesAsync(TestContext.Current.CancellationToken);

        Assert.Equal(2, context.Credentials.Count());
    }

    [Fact]
    public async Task HasDriversLicenseAsync_ReturnsTrueOnlyAfterOneExists()
    {
        using var context = CreateContext();
        var citizen = await SeedCitizenAsync(context);
        var repo = new CredentialsActivationRepository(context);

        Assert.False(await repo.HasDriversLicenseAsync(citizen.Id, TestContext.Current.CancellationToken));

        await repo.AddCredentialAsync(BuildDriversLicenseCredential(citizen.Id, "DL0000001"), TestContext.Current.CancellationToken);
        await repo.SaveChangesAsync(TestContext.Current.CancellationToken);

        Assert.True(await repo.HasDriversLicenseAsync(citizen.Id, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GetCitizenBySaIdAsync_ReturnsCitizenWithUserAndCredentialsIncluded()
    {
        using var context = CreateContext();
        var citizen = await SeedCitizenAsync(context);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "lebron@example.com",
            PhoneNumber = "+27821234567",
            PasswordHash = "hash",
            Role = UserRole.Citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        citizen.UserId = user.Id;

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var repo = new CredentialsActivationRepository(context);

        await repo.AddCredentialAsync(BuildDriversLicenseCredential(citizen.Id, "DL0000001"), TestContext.Current.CancellationToken);
        await repo.SaveChangesAsync(TestContext.Current.CancellationToken);

        var reloaded = await repo.GetCitizenBySaIdAsync(KnownSaId, TestContext.Current.CancellationToken);

        Assert.NotNull(reloaded);
        Assert.NotNull(reloaded!.User);
        Assert.Equal("lebron@example.com", reloaded.User!.Email);

        var credential = Assert.Single(reloaded.Credentials);

        Assert.NotNull(credential.DriversLicense);
    }

    [Fact]
    public async Task GetCitizenBySaIdAsync_UnknownSaId_ReturnsNull()
    {
        using var context = CreateContext();
        var repo = new CredentialsActivationRepository(context);
        var result = await repo.GetCitizenBySaIdAsync(KnownSaId, TestContext.Current.CancellationToken);

        Assert.Null(result);
    }

    [Fact]
    public async Task AddNotificationAsync_PersistsNotification()
    {
        using var context = CreateContext();
        var citizen = await SeedCitizenAsync(context);
        var repo = new CredentialsActivationRepository(context);

        await repo.AddNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Title = "New credential added",
            Description = "A DriversLicense has been added to your FlashID wallet.",
            Tone = "Success",
            CreatedAt = DateTime.UtcNow,
        }, TestContext.Current.CancellationToken);

        await repo.SaveChangesAsync(TestContext.Current.CancellationToken);

        var notification = Assert.Single(context.Notifications);

        Assert.Equal(citizen.Id, notification.CitizenId);
    }
}
