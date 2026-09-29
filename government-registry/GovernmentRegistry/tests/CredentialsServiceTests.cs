using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Domain.Entities;


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
    [Fact]
    public async Task GetIdentityDocumentAsync_DocumentExists_ReturnsMappedResponse()
    {
        var citizen = CredentialTestData.ValidCitizenRecord();
        var document = CredentialTestData.ValidIdentityDocument(citizen);
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
        var citizen = CredentialTestData.ValidCitizenRecord();
        var license = CredentialTestData.ValidDriversLicense(citizen);
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