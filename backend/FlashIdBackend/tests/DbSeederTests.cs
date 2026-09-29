using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class DbSeederTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task SeedE2ETestUsersAsync_EmptyDatabase_CreatesCitizenAndGovAdminUsers()
    {
        using var context = CreateContext();

        await DbSeeder.SeedE2ETestUsersAsync(context);

        var citizenUser = await context.DomainUsers.FirstOrDefaultAsync(u => u.Email == "citizen.e2e@flashid.local", TestContext.Current.CancellationToken);
        Assert.NotNull(citizenUser);
        Assert.Equal(UserRole.Citizen, citizenUser.Role);

        var citizen = await context.Citizens.FirstOrDefaultAsync(c => c.UserId == citizenUser.Id, TestContext.Current.CancellationToken);
        Assert.NotNull(citizen);
        Assert.Equal(CitizenStatus.Activated, citizen.Status);

        var govUser = await context.DomainUsers.FirstOrDefaultAsync(u => u.Email == "govadmin.e2e@flashid.local", TestContext.Current.CancellationToken);
        Assert.NotNull(govUser);
        Assert.Equal(UserRole.GovernmentAdministrator, govUser.Role);

        var govAdmin = await context.GovernmentAdministrators.FirstOrDefaultAsync(g => g.UserId == govUser.Id, TestContext.Current.CancellationToken);
        Assert.NotNull(govAdmin);
        Assert.Equal("GOVE2E01", govAdmin.GovernmentId);
    }

    [Fact]
    public async Task SeedE2ETestUsersAsync_NoInstitutionExists_CreatesOfficialUserWithoutOfficialRecord()
    {
        using var context = CreateContext();

        await DbSeeder.SeedE2ETestUsersAsync(context);

        var officialUser = await context.DomainUsers.FirstOrDefaultAsync(u => u.Email == "official.e2e@flashid.local", TestContext.Current.CancellationToken);
        Assert.NotNull(officialUser);
        Assert.Equal(UserRole.Official, officialUser.Role);

        var official = await context.Officials.FirstOrDefaultAsync(o => o.UserId == officialUser.Id, TestContext.Current.CancellationToken);
        Assert.Null(official);
    }

    [Fact]
    public async Task SeedE2ETestUsersAsync_InstitutionExists_CreatesOfficialRecord()
    {
        using var context = CreateContext();

        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "existing-admin@flashid.gov.za",
            PhoneNumber = "0820000099",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            IsDeleted = false,
            IsEmailVerified = true,
            Role = UserRole.GovernmentAdministrator,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        context.DomainUsers.Add(adminUser);

        var admin = new GovernmentAdministrator
        {
            Id = Guid.NewGuid(),
            GovernmentId = "GOV-EXIST-01",
            Names = "Existing",
            Surname = "Admin",
            UserId = adminUser.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        context.GovernmentAdministrators.Add(admin);

        var institution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = "Existing Institution",
            Type = InstitutionType.HomeAffairs,
            VerificationNumber = "EXIST-001",
            ApiKeyReference = Guid.NewGuid(),
            RegisteredById = admin.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        context.Institutions.Add(institution);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        await DbSeeder.SeedE2ETestUsersAsync(context);

        var officialUser = await context.DomainUsers.FirstOrDefaultAsync(u => u.Email == "official.e2e@flashid.local", TestContext.Current.CancellationToken);
        Assert.NotNull(officialUser);

        var official = await context.Officials.FirstOrDefaultAsync(o => o.UserId == officialUser.Id, TestContext.Current.CancellationToken);
        Assert.NotNull(official);
        Assert.Equal(institution.Id, official.InstitutionId);
        Assert.Equal("OFFE2E01", official.OfficialId);
    }

    [Fact]
    public async Task SeedE2ETestUsersAsync_CalledTwice_DoesNotDuplicateUsers()
    {
        using var context = CreateContext();

        await DbSeeder.SeedE2ETestUsersAsync(context);
        await DbSeeder.SeedE2ETestUsersAsync(context);

        var citizenCount = await context.DomainUsers.CountAsync(u => u.Email == "citizen.e2e@flashid.local", TestContext.Current.CancellationToken);
        var govAdminCount = await context.DomainUsers.CountAsync(u => u.Email == "govadmin.e2e@flashid.local", TestContext.Current.CancellationToken);
        var officialCount = await context.DomainUsers.CountAsync(u => u.Email == "official.e2e@flashid.local", TestContext.Current.CancellationToken);

        Assert.Equal(1, citizenCount);
        Assert.Equal(1, govAdminCount);
        Assert.Equal(1, officialCount);
    }
}