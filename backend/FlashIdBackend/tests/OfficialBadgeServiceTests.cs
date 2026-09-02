using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.Officials.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class OfficialBadgeServiceTests
{
    private sealed class FakeOfficialRepository : IOfficialRepository
    {
        public Official? OfficialToReturn { get; set; }

        public Task<Official?> GetByUserIdAsync(Guid userId) => Task.FromResult(OfficialToReturn);
        public Task<Official?> GetByIdAsync(Guid id) => Task.FromResult(OfficialToReturn);
    }

    private sealed class FakeQrSigningProvider : IQrSigningProvider
    {
        public bool VerifyResult { get; set; } = true;
        public string CurrentKeyId => "test-key";
        public string Sign(string payload) => "this-signature-is-fake";
        public bool Verify(string payload, string signature, string keyId) => VerifyResult;
    }

    private static Official ValidOfficial(InstitutionType institutionType)
    {
        var institution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = "SAPS Tshwane",
            Type = institutionType,
            ApiKeyReference = Guid.NewGuid(),
            VerificationNumber = "VN-0001",
            RegisteredById = Guid.NewGuid(),
        };

        return new Official
        {
            Id = Guid.NewGuid(),
            OfficialId = "OFF0001",
            Names = "Takunda",
            Surname = "Moyo",
            UserId = Guid.NewGuid(),
            InstitutionId = institution.Id,
            Institution = institution,
        };
    }

    [Fact]
    public async Task GenerateBadgeTokenAsync_OfficialExists_ReturnsToken()
    {
        var official = ValidOfficial(InstitutionType.LawEnforcement);
        var fakeRepository = new FakeOfficialRepository { OfficialToReturn = official };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var service = new OfficialBadgeService(fakeRepository, fakeSigningProvider);

        var res = await service.GenerateBadgeTokenAsync(official.UserId);

        Assert.False(string.IsNullOrEmpty(res.Token));
        Assert.True(res.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public async Task GenerateBadgeTokenAsync_OfficialNotFound_ThrowsOfficialNotFoundException()
    {
        var fakeRepository = new FakeOfficialRepository { OfficialToReturn = null };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var service = new OfficialBadgeService(fakeRepository, fakeSigningProvider);

        await Assert.ThrowsAsync<OfficialNotFoundException>(() => service.GenerateBadgeTokenAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task VerifyBadgeAsync_ValidLawEnforcementBadge_ReturnsRequiredMode()
    {
        var official = ValidOfficial(InstitutionType.LawEnforcement);
        var fakeRepository = new FakeOfficialRepository { OfficialToReturn = official };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var service = new OfficialBadgeService(fakeRepository, fakeSigningProvider);

        var badge = await service.GenerateBadgeTokenAsync(official.UserId);
        var res = await service.VerifyBadgeAsync(badge.Token);

        Assert.Equal(official.Institution.Name, res.InstitutionName);
        Assert.Equal(InstitutionType.LawEnforcement, res.InstitutionType);
        Assert.Equal(DisclosurePolicyMode.Required, res.Mode);
        Assert.Equal(QrFieldDefinitions.IdentityDocumentMandatoryFields, res.SuggestedIdentityDocumentFields);
        Assert.Equal(QrFieldDefinitions.DriversLicenseMandatoryFields, res.SuggestedDriversLicenseFields);
    }

    [Fact]
    public async Task VerifyBadgeAsync_ValidHomeAffairsBadge_ReturnsSuggestedMode()
    {
        var official = ValidOfficial(InstitutionType.HomeAffairs);
        var fakeRepository = new FakeOfficialRepository { OfficialToReturn = official };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var service = new OfficialBadgeService(fakeRepository, fakeSigningProvider);

        var badge = await service.GenerateBadgeTokenAsync(official.UserId);
        var res = await service.VerifyBadgeAsync(badge.Token);

        Assert.Equal(DisclosurePolicyMode.Suggested, res.Mode);
    }

    [Fact]
    public async Task VerifyBadgeAsync_InvalidSignature_ThrowsInvalidBadgeTokenException()
    {
        var official = ValidOfficial(InstitutionType.LawEnforcement);
        var fakeRepository = new FakeOfficialRepository { OfficialToReturn = official };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var service = new OfficialBadgeService(fakeRepository, fakeSigningProvider);

        var badge = await service.GenerateBadgeTokenAsync(official.UserId);
        fakeSigningProvider.VerifyResult = false;

        await Assert.ThrowsAsync<InvalidBadgeTokenException>(() => service.VerifyBadgeAsync(badge.Token));
    }

    [Fact]
    public async Task VerifyBadgeAsync_MalformedToken_ThrowsInvalidBadgeTokenException()
    {
        var fakeRepository = new FakeOfficialRepository();
        var fakeSigningProvider = new FakeQrSigningProvider();
        var service = new OfficialBadgeService(fakeRepository, fakeSigningProvider);

        await Assert.ThrowsAsync<InvalidBadgeTokenException>(() => service.VerifyBadgeAsync("not-valid-base64!!!"));
    }

    [Fact]
    public async Task VerifyBadgeAsync_OfficialNoLongerExists_ThrowsInvalidBadgeTokenException()
    {
        var official = ValidOfficial(InstitutionType.LawEnforcement);
        var fakeRepository = new FakeOfficialRepository { OfficialToReturn = official };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var service = new OfficialBadgeService(fakeRepository, fakeSigningProvider);

        var badge = await service.GenerateBadgeTokenAsync(official.UserId);
        fakeRepository.OfficialToReturn = null;

        await Assert.ThrowsAsync<InvalidBadgeTokenException>(() => service.VerifyBadgeAsync(badge.Token));
    }
}