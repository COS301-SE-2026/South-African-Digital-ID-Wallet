using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class CredentialsServiceTests
{
    private sealed class FakeCredentialsRepository : ICredentialsRepository
    {
        public IdentityDocument? IdentityDocumentToReturn { get; set; }
        public DriversLicense? DriversLicenseToReturn { get; set; }

        public Task<IdentityDocument?> GetIdentityDocumentBySaIdAsync(string saId, CancellationToken cancellationToken) =>
            Task.FromResult(IdentityDocumentToReturn);

        public Task<DriversLicense?> GetDriversLicenseBySaIdAsync(string saId, CancellationToken cancellationToken) =>
            Task.FromResult(DriversLicenseToReturn);
    }

    private static CitizenRecord ValidCitizen() => new()
    {
        Id = Guid.NewGuid(),
        SaId = "9001015800083",
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
    public async Task GetIdentityDocumentAsync_DocumentExists_ReturnsMappedResponse()
    {
        var citizen = ValidCitizen();
        var document = ValidIdentityDocument(citizen);
        var repository = new FakeCredentialsRepository { IdentityDocumentToReturn = document };
        var service = new CredentialsService(repository);

        var result = await service.GetIdentityDocumentAsync(citizen.SaId, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(document.Nationality, result.Nationality);
    }

    [Fact]
    public async Task GetIdentityDocumentAsync_DocumentNotFound_ReturnsNull()
    {
        var repository = new FakeCredentialsRepository { IdentityDocumentToReturn = null };
        var service = new CredentialsService(repository);

        var result = await service.GetIdentityDocumentAsync("0000000000000", CancellationToken.None);

        Assert.Null(result);
    }
    [Fact]
    public async Task GetIdentityDocumentAsync_NullSaId_ThrowsArgumentNullException()
    {
        var repository = new FakeCredentialsRepository();
        var service = new CredentialsService(repository);

        await Assert.ThrowsAsync<ArgumentNullException>(
            () => service.GetIdentityDocumentAsync(null!, CancellationToken.None));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GetIdentityDocumentAsync_EmptyOrWhitespaceSaId_ThrowsArgumentException(string saId)
    {
        var repository = new FakeCredentialsRepository();
        var service = new CredentialsService(repository);

        await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetIdentityDocumentAsync(saId, CancellationToken.None));
    }

    [Fact]
    public async Task GetDriversLicenseAsync_NullSaId_ThrowsArgumentNullException()
    {
        var repository = new FakeCredentialsRepository();
        var service = new CredentialsService(repository);

        await Assert.ThrowsAsync<ArgumentNullException>(
            () => service.GetDriversLicenseAsync(null!, CancellationToken.None));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GetDriversLicenseAsync_EmptyOrWhitespaceSaId_ThrowsArgumentException(string saId)
    {
        var repository = new FakeCredentialsRepository();
        var service = new CredentialsService(repository);

        await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetDriversLicenseAsync(saId, CancellationToken.None));
    }

    [Fact]
    public async Task GetDriversLicenseAsync_LicenseExists_ReturnsMappedResponse()
    {
        var citizen = ValidCitizen();
        var license = ValidDriversLicense(citizen);
        var repository = new FakeCredentialsRepository { DriversLicenseToReturn = license };
        var service = new CredentialsService(repository);

        var result = await service.GetDriversLicenseAsync(citizen.SaId, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(license.LicenseNumber, result.LicenseNumber);
    }

    [Fact]
    public async Task GetDriversLicenseAsync_LicenseNotFound_ReturnsNull()
    {
        var repository = new FakeCredentialsRepository { DriversLicenseToReturn = null };
        var service = new CredentialsService(repository);

        var result = await service.GetDriversLicenseAsync("0000000000000", CancellationToken.None);

        Assert.Null(result);
    }

}