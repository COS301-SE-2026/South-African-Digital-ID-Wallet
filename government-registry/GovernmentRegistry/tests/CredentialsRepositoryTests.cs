using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class CredentialsRepositoryTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static CitizenRecord ValidCitizenRecord(string saId) => new()
    {
        Id = Guid.NewGuid(),
        SaId = saId,
        Names = "Thandiwe",
        Surname = "Mokoena",
        Gender = Gender.Female,
        DateOfBirth = new DateOnly(1990, 1, 1),
    };

    private static IdentityDocument ValidIdentityDocument(CitizenRecord citizen) => new()
    {
        Id = Guid.NewGuid(),
        Signature = "sig",
        IssuedBy = "Home Affairs",
        IssueDate = new DateOnly(2021, 3, 15),
        CitizenId = citizen.Id,
        Citizen = citizen,
        CountryOfBirth = "South Africa",
        CitizenshipStatus = CitizenStatus.Citizen,
        Nationality = "South African",
        PhotoBlob = "photo.jpg",
    };

    private static DriversLicense ValidDriversLicense(CitizenRecord citizen) => new()
    {
        Id = Guid.NewGuid(),
        Signature = "sig",
        IssuedBy = "Licensing Department",
        IssueDate = new DateOnly(2021, 3, 15),
        CitizenId = citizen.Id,
        Citizen = citizen,
        LicenseNumber = "4589161234567",
        LicenseCode = LicenseCode.C,
        Restrictions = "01",
        ExpiryDate = new DateOnly(2030, 1, 1),
        PhotoBlob = "license.jpg",
    };

    [Fact]
    public async Task GetIdentityDocumentBySaIdAsync_DocumentExists_ReturnsDocument()
    {
        using var context = CreateContext();
        var citizen = ValidCitizenRecord("9001015800083");
        var document = ValidIdentityDocument(citizen);
        await context.CitizenRecords.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.IdentityDocuments.AddAsync(document, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var repository = new CredentialsRepository(context);
        var result = await repository.GetIdentityDocumentBySaIdAsync("9001015800083", TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.Equal(document.Id, result.Id);
        Assert.Equal(document.Nationality, result.Nationality);
    }

    [Fact]
    public async Task GetIdentityDocumentBySaIdAsync_DocumentNotFound_ReturnsNull()
    {
        using var context = CreateContext();
        var repository = new CredentialsRepository(context);

        var result = await repository.GetIdentityDocumentBySaIdAsync("0000000000000", TestContext.Current.CancellationToken);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetDriversLicenseBySaIdAsync_LicenseExists_ReturnsLicense()
    {
        using var context = CreateContext();
        var citizen = ValidCitizenRecord("9001015800083");
        var license = ValidDriversLicense(citizen);
        await context.CitizenRecords.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.DriversLicenses.AddAsync(license, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var repository = new CredentialsRepository(context);
        var result = await repository.GetDriversLicenseBySaIdAsync("9001015800083", TestContext.Current.CancellationToken);

        Assert.NotNull(result);
        Assert.Equal(license.Id, result.Id);
        Assert.Equal(license.LicenseNumber, result.LicenseNumber);
    }

    [Fact]
    public async Task GetDriversLicenseBySaIdAsync_LicenseNotFound_ReturnsNull()
    {
        using var context = CreateContext();
        var repository = new CredentialsRepository(context);

        var result = await repository.GetDriversLicenseBySaIdAsync("0000000000000", TestContext.Current.CancellationToken);

        Assert.Null(result);
    }
}