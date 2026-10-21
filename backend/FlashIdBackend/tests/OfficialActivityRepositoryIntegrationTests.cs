using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace tests;

// Runs the real queries on SQLite, because the category and privacy rules live in the SQL, not in the service
public class OfficialActivityRepositoryIntegrationTests
{
    private const string CitizenNames = "Thandi";
    private const string CitizenSurname = "Mokoena";
    private const string CitizenSaId = "9001015800081";
    private const string QrDetails = "Credential abc verified via QR disclosure (3 field(s)).";

    private sealed record Seed(AppDbContext Context, Guid InstitutionId, Guid OfficialUserId, Guid CitizenId, Guid CredentialId);

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

    private static User NewUser(UserRole role, string email) => new()
    {
        Id = Guid.NewGuid(),
        Email = email,
        PhoneNumber = "0821234567",
        PasswordHash = "hash", // NOSONAR
        PasswordSet = true,
        IsEmailVerified = true,
        Role = role,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
    };

    // One institution, one official, one citizen with a driver's licence: the minimum the joins and foreign keys need
    private static async Task<Seed> SeedAsync()
    {
        var context = CreateContext();
        var now = DateTime.UtcNow;

        var adminUser = NewUser(UserRole.GovernmentAdministrator, "admin@test.local");
        var admin = new GovernmentAdministrator
        {
            Id = Guid.NewGuid(),
            GovernmentId = "GA-0001",
            Names = "Admin",
            Surname = "User",
            UserId = adminUser.Id,
            CreatedAt = now,
            UpdatedAt = now,
        };
        var institution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = "Home Affairs Pretoria",
            Type = InstitutionType.HomeAffairs,
            ApiKeyReference = Guid.NewGuid(),
            VerificationNumber = "HA-001",
            RegisteredById = admin.Id,
            CreatedAt = now,
            UpdatedAt = now,
        };
        var officialUser = NewUser(UserRole.Official, "official@test.local");
        var official = new Official
        {
            Id = Guid.NewGuid(),
            OfficialId = "OF-0001",
            Names = "Sipho",
            Surname = "Ndlovu",
            UserId = officialUser.Id,
            InstitutionId = institution.Id,
            CreatedAt = now,
            UpdatedAt = now,
        };
        var citizenUser = NewUser(UserRole.Citizen, "citizen@test.local");
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = CitizenSaId,
            Names = CitizenNames,
            Surname = CitizenSurname,
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Status = CitizenStatus.Activated,
            UserId = citizenUser.Id,
            CreatedAt = now,
            UpdatedAt = now,
        };
        var credentialId = Guid.NewGuid();
        var credential = new Credential
        {
            Id = credentialId,
            Status = CredentialStatus.Active,
            Signature = "sig",
            IssuedBy = "Licensing Dept",
            IssueDate = now.AddYears(-1),
            CitizenId = citizen.Id,
            CreatedAt = now,
            UpdatedAt = now,
            DriversLicense = new DriversLicense
            {
                Id = Guid.NewGuid(),
                CredentialId = credentialId,
                LicenseNumber = "1234567890123",
                LicenseCode = LicenseCode.EB,
                Restrictions = "00",
                ExpiryDate = now.AddYears(4),
                PhotoPath = "photo.png",
                CountryOfIssue = "South Africa",
                CreatedAt = now,
                UpdatedAt = now,
            },
        };

        context.DomainUsers.AddRange(adminUser, officialUser, citizenUser);
        context.GovernmentAdministrators.Add(admin);
        context.Institutions.Add(institution);
        context.Officials.Add(official);
        context.Citizens.Add(citizen);
        context.Credentials.Add(credential);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var seed = new Seed(context, institution.Id, officialUser.Id, citizen.Id, credentialId);

        // One account event, one onboarding (citizen shown), one QR verification (citizen hidden)
        context.AuditLogs.AddRange(
            Log(seed, AuditEventType.DeviceVerified, "User official@test.local verified and trusted a new device.", citizen: false, credential: false, minutesAgo: 3),
            Log(seed, AuditEventType.OnboardCitizen, $"Citizen, {CitizenSaId}, has been onboarded.", citizen: true, credential: false, minutesAgo: 2),
            Log(seed, AuditEventType.CredentialVerified, QrDetails, citizen: true, credential: true, minutesAgo: 1));
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        return seed;
    }

    private static AuditLog Log(Seed seed, AuditEventType eventType, string details, bool citizen, bool credential, int minutesAgo) => new()
    {
        Id = Guid.NewGuid(),
        EventType = eventType,
        Details = details,
        IpAddress = "127.0.0.1",
        ActorId = seed.OfficialUserId,
        CitizenId = citizen ? seed.CitizenId : null,
        CredentialId = credential ? seed.CredentialId : null,
        CreatedAt = DateTime.UtcNow.AddMinutes(-minutesAgo),
    };

    private static Task<(List<Application.Features.Officials.DTOs.OfficialHistoryItemDto> Items, int TotalCount)> History(
        Seed seed, string? category = null, string? search = null) =>
        new OfficialActivityRepository(seed.Context)
            .GetInstitutionHistoryAsync(seed.InstitutionId, search, null, null, null, null, 1, 20, category);

    [Fact]
    public async Task History_WorkCategory_ExcludesAccountEvents()
    {
        var seed = await SeedAsync();
        using var context = seed.Context;

        var (items, total) = await History(seed, category: "work");

        Assert.Equal(2, total);
        Assert.DoesNotContain(items, i => i.Action == nameof(AuditEventType.DeviceVerified));
    }

    [Fact]
    public async Task History_SecurityCategory_ReturnsOnlyAccountEvents()
    {
        var seed = await SeedAsync();
        using var context = seed.Context;

        var (items, _) = await History(seed, category: "security");

        var item = Assert.Single(items);
        Assert.Equal(nameof(AuditEventType.DeviceVerified), item.Action);
    }

    [Fact]
    public async Task History_NoCategory_ReturnsEverything()
    {
        var seed = await SeedAsync();
        using var context = seed.Context;

        var (_, total) = await History(seed);

        Assert.Equal(3, total);
    }

    [Fact]
    public async Task History_VerificationRow_HidesCitizenAndShowsDisclosureSummary()
    {
        var seed = await SeedAsync();
        using var context = seed.Context;

        var (items, _) = await History(seed);
        var verification = items.Single(i => i.Action == nameof(AuditEventType.CredentialVerified));

        Assert.Null(verification.CitizenName);
        Assert.Null(verification.CitizenSaId);
        Assert.Equal("Driver's Licence · 3 fields disclosed", verification.Summary);
    }

    [Fact]
    public async Task History_OnboardingRow_KeepsCitizen()
    {
        var seed = await SeedAsync();
        using var context = seed.Context;

        var (items, _) = await History(seed);
        var onboarding = items.Single(i => i.Action == nameof(AuditEventType.OnboardCitizen));

        Assert.Equal($"{CitizenNames} {CitizenSurname}", onboarding.CitizenName);
        Assert.Equal(CitizenSaId, onboarding.CitizenSaId);
    }

    [Fact]
    public async Task History_SearchingCitizenName_DoesNotRevealVerification()
    {
        var seed = await SeedAsync();
        using var context = seed.Context;

        var (items, _) = await History(seed, search: CitizenNames);

        // The onboarding is found by name, the verification of the same citizen is not
        var item = Assert.Single(items);
        Assert.Equal(nameof(AuditEventType.OnboardCitizen), item.Action);
    }

    [Fact]
    public async Task RecentActivity_ExcludesAccountEvents_AndUsesSummary()
    {
        var seed = await SeedAsync();
        using var context = seed.Context;

        var items = await new OfficialActivityRepository(seed.Context).GetRecentByActorAsync(seed.OfficialUserId, 10);

        Assert.Equal(2, items.Count);
        Assert.DoesNotContain(items, i => i.EventType == nameof(AuditEventType.DeviceVerified));
        Assert.Equal("Driver's Licence · 3 fields disclosed", items.Single(i => i.EventType == nameof(AuditEventType.CredentialVerified)).Summary);
    }
}
