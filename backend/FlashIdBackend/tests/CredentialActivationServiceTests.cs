using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Enums;
using Application.Features.Onboarding.Dtos;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class CredentialActivationServiceTests
{
    private const string KnownSaId = "9001015800086";
    private const string TestIpAddress = "196.25.1.10";

    private sealed class FakeCredentialRepo : ICredentialRepository
    {
        public Citizen? CitizenToReturn { get; set; }
        public Task<Citizen?> GetCitizenByIdAsync(Guid u, CancellationToken c) => Task.FromResult(CitizenToReturn);
        public Task<Citizen?> GetCitizenByUserIdAsync(Guid u) => Task.FromResult(CitizenToReturn);
        public Task<Credential?> GetByIdAsync(Guid i) => Task.FromResult<Credential?>(null);
        public Task<List<Credential>> GetByUserIdAsync(Guid u) => Task.FromResult(new List<Credential>());
        public Task<List<Credential>> GetCredentialsByCitizenIdAsync(Guid c) => Task.FromResult(new List<Credential>());
        public Task SaveChangesAsync() => Task.CompletedTask;
    }

    private sealed class FakeGateway : IGovernmentRegistryGateway
    {
        public GovernmentRegistryIdentityDocumentDto? Id;
        public GovernmentRegistryDriversLicenseDto? Dl;
        public Task<CitizenRecordDto?> GetCitizenBySaIdAsync(string s) => Task.FromResult<CitizenRecordDto?>(null);
        public Task<GovernmentRegistryIdentityDocumentDto?> GetIdentityDocumentBySaIdAsync(string s, CancellationToken c) => Task.FromResult(Id);
        public Task<GovernmentRegistryDriversLicenseDto?> GetDriversLicenseBySaIdAsync(string s, CancellationToken c) => Task.FromResult(Dl);
    }

    private sealed class FakeActivationRepo : ICredentialsActivationRepository
    {
        public bool HasId, HasDl;
        public List<Credential> Added = new();
        public int Saves;
        public Task<bool> HasIdentityDocumentAsync(Guid c, CancellationToken t) => Task.FromResult(HasId);
        public Task<bool> HasDriversLicenseAsync(Guid c, CancellationToken t) => Task.FromResult(HasDl);
        public Task AddCredentialAsync(Credential c, CancellationToken t) { Added.Add(c); return Task.CompletedTask; }
        public Task AddIdentityDocumentAsync(IdentityDocument d, CancellationToken t) => Task.CompletedTask;
        public Task AddDriversLicenseAsync(DriversLicense d, CancellationToken t) => Task.CompletedTask;
        public Task AddAuditLogAsync(AuditLog a, CancellationToken t) => Task.CompletedTask;
        public Task SaveChangesAsync(CancellationToken t) { Saves++; return Task.CompletedTask; }
    }

    private sealed class Ctx
    {
        public Citizen Citizen = null!;
        public FakeActivationRepo Repo = null!;
        public CredentialActivationService Service = null!;
    }

    private static Ctx Setup(CitizenStatus status = CitizenStatus.Verified, bool noCitizen = false, bool hasId = false, bool hasDl = false, bool idAvailable = true, bool dlAvailable = true)
    {
        var citizen = new Citizen { Id = Guid.NewGuid(), SaId = KnownSaId, Status = status };
        var repo = new FakeActivationRepo { HasId = hasId, HasDl = hasDl };
        var gateway = new FakeGateway
        {
            Id = idAvailable ? new() { Signature = "sig-id", IssuedBy = "DHA", IssueDate = new DateOnly(2015, 6, 1), CountryOfBirth = "South Africa", CitizenshipStatus = "Citizen", Nationality = "South African", PhotoBlob = "id-photo" } : null,
            Dl = dlAvailable ? new() { Signature = "sig-dl", IssuedBy = "RTMC", IssueDate = new DateOnly(2020, 3, 15), LicenseNumber = "DL1234567", LicenseCode = "EB", Restrictions = "None", ExpiryDate = new DateOnly(2030, 3, 15), PhotoBlob = "dl-photo" } : null,
        };

        return new Ctx
        {
            Citizen = citizen,
            Repo = repo,
            Service = new CredentialActivationService(
                new FakeCredentialRepo { CitizenToReturn = noCitizen ? null : citizen }, gateway, repo
            ),
        };
    }

    private static Task<ActivateCredentialsResponseDto> Act(Ctx c, params CredentialType[] types) => c.Service.ActivateCredentialsAsync(new() { CredentialTypes = types.ToList() }, Guid.NewGuid(), TestIpAddress, TestContext.Current.CancellationToken);

    [Fact]
    public async Task noCitizenLinked_Throws()
    {
        var c = Setup(noCitizen: true);
        await Assert.ThrowsAsync<InvalidOperationException>(() => Act(c, CredentialType.IdentityDocument));
        Assert.Empty(c.Repo.Added);
    }

    [Fact]
    public async Task CitizenNotVerified_Throws()
    {
        var c = Setup(status: CitizenStatus.Pending);
        await Assert.ThrowsAsync<InvalidOperationException>(() => Act(c, CredentialType.IdentityDocument));
        Assert.Empty(c.Repo.Added);
        Assert.Equal(0, c.Repo.Saves);
    }

    [Fact]
    public async Task NoCredentialTypes_Throws()
    {
        var c = Setup();
        await Assert.ThrowsAsync<ArgumentNullException>(() => Act(c));
        Assert.Empty(c.Repo.Added);
    }

    [Fact]
    public async Task UnsupportedCredentialType_Throws()
    {
        var c = Setup();
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => Act(c, (CredentialType)99));
        Assert.Empty(c.Repo.Added);
    }

    [Fact]
    public async Task IdentityDocument_CreatesActiveCredentialAndActivatesCitizen()
    {
        var c = Setup();
        var response = await Act(c, CredentialType.IdentityDocument);
        Assert.Equal("Success", response.Status);
        Assert.Contains("activated successfully: Identity Document", response.Message);
        var credential = Assert.Single(c.Repo.Added);
        Assert.Equal(c.Citizen.Id, credential.CitizenId);
        Assert.Equal(CredentialStatus.Active, credential.Status);
        Assert.Equal(new DateTime(2015, 6, 1), credential.IssueDate);
        Assert.Equal(IdentityDocumentStatus.Citizen, credential.IdentityDocument!.Status);
        Assert.Null(credential.DriversLicense);
        Assert.Equal(CitizenStatus.Activated, c.Citizen.Status);
        Assert.NotNull(c.Citizen.ActivatedAt);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Fact]
    public async Task DriversLicense_CreatesActiveCredential()
    {
        var c = Setup();
        var response = await Act(c, CredentialType.DriversLicense);
        Assert.Contains("activated successfully: Driver's License", response.Message);
        var credential = Assert.Single(c.Repo.Added);
        Assert.Equal(LicenseCode.EB, credential.DriversLicense!.LicenseCode);
        Assert.Equal(new DateTime(2030, 3, 15), credential.DriversLicense.ExpiryDate);
        Assert.Null(credential.IdentityDocument);
        Assert.Equal(CitizenStatus.Activated, c.Citizen.Status);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Fact]
    public async Task BothTypes_AddsTwoCredentialsAndSavesOnce()
    {
        var c = Setup();
        await Act(c, CredentialType.IdentityDocument, CredentialType.DriversLicense);
        Assert.Equal(2, c.Repo.Added.Count);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Fact]
    public async Task DuplicateTypesInRequest_ActivatesOnce()
    {
        var c = Setup();
        await Act(c, CredentialType.IdentityDocument, CredentialType.IdentityDocument);
        Assert.Single(c.Repo.Added);
    }

    [Fact]
    public async Task AlreadyActivated_SkipsAndReports()
    {
        var c = Setup(hasId: true);
        var response = await Act(c, CredentialType.IdentityDocument);
        Assert.Contains("already activated: Identity Document", response.Message);
        Assert.DoesNotContain("activated successfully", response.Message);
        Assert.Empty(c.Repo.Added);
        Assert.Equal(CitizenStatus.Verified, c.Citizen.Status);
        Assert.Equal(0, c.Repo.Saves);
    }

    [Fact]
    public async Task MixedOutcomes_ReportsActivatedAndUnavailable()
    {
        var c = Setup(dlAvailable: false);
        var response = await Act(c, CredentialType.IdentityDocument, CredentialType.DriversLicense);
        Assert.Contains("activated successfully: Identity Document", response.Message);
        Assert.Contains("unavailable: Driver's License", response.Message);
        Assert.Single(c.Repo.Added);
        Assert.Equal(1, c.Repo.Saves);
    }
}