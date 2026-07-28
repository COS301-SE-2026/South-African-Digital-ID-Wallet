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

    private sealed class FakeCredentialRepo : ICredentialRepo
    {
        public Citizen? CitizenToReturn { get; set; }
        public Task<Citizen?> GetCitizenByIdAsync(Guid u, CancellationToken c) => Task.FromResult(CitizenToReturn);
        public Task<Citizen?> GetCitizenByUserIdAsync(Guid u) => Task.FromResult(CitizenToReturn);
        public Task<Credential?> GetByIdAsync(Guid i) => Task.FromResult<Credential?>(null);
        public Task<List<Credential>> GetByUserIdAsync(Guid u) => Task.FromResult(new List<Credential>());
        public Task<List<Credential>> GetCredentialsByCitizenIdAsync(Guid c) => Task.FromResult(new List<Credential>());
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
        var citizen = new Citizen { Id = Guid.NewGuid(), SaId = SaId, Status = status };
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
                new FakeCredentialRepo { Citizen = noCitizen ? null : citizen }, gateway, repo
            ),
        };
    }
}