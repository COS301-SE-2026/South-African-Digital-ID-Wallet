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
        DriversLicense = new DriversLicense
        {
            Id = Guid.NewGuid(),
            CitizenId = citizenId,
            LicenseNumber = licenseNumber,
            LicenseCode = LicenseCode.EB,
            Restrictions = "None",
            ExpiryDate = DateTime.UtcNow.AddYears(5),
            PhotoPath = "photo.png",
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
        IdentityDocument = new IdentityDocument
        {
            Id = Guid.NewGuid(),
            CitizenId = citizenId,
            Citizenship = "South Africa",
            CountryOfBirth = "South Africa",
            Nationality = "South African",
            Status = IdentityDocumentStatus.Citizen,
            PhotoPath = "photo.png",
        },
    };
}
