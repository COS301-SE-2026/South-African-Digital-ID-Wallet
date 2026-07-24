using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class QrServiceTests
{
    private class FakeCredentialRepository : ICredentialRepository
    {
        public Credential? CredentialToReturn { get; set; }
        public List<Credential> CredentialsToReturn { get; set; } = new();

        public Task<Credential?> GetByIdAsync(Guid id) => Task.FromResult(CredentialToReturn);
        public Task<List<Credential>> GetByUserIdAsync(Guid userId) => Task.FromResult(CredentialsToReturn);
    }

    private sealed class FakeQrSigningProvider : IQrSigningProvider
    {
        public string Sign(string payload) => "fake-signature";
        public bool Verify(string payload, string signature) => true;
    }

    private sealed class FakeQrDisclosureTokenRepository : IQrDisclosureTokenRepository
    {
        public List<QrDisclosureToken> Tokens { get; } = new();

        public Task AddAsync(QrDisclosureToken token)
        {
            Tokens.Add(token);
            return Task.CompletedTask;
        }

        public Task<bool> TryMarkUsedAsync(Guid jti)
        {
            var token = Tokens.FirstOrDefault(q => q.Jti == jti && q.UsedAt == null);
            if (token == null) return Task.FromResult(false);

            token.UsedAt = DateTime.UtcNow;
            return Task.FromResult(true);
        }
    }

    private sealed class FakeInstitutionRepository : IInstitutionRepository
    {
        public List<AuditLog> AuditLogs { get; } = new();
        public Task<GovernmentAdministrator?> GetAdminByIdAsync(Guid adminId) => Task.FromResult<GovernmentAdministrator?>(null);
        public Task<bool> InstitutionExistsByVerificationNumberAsync(string verificationNumber) => Task.FromResult(false);
        public Task AddInstitutionAsync(Institution institution) => Task.CompletedTask;
        public Task AddAuditLogAsync(AuditLog auditLog)
        {
            AuditLogs.Add(auditLog);
            return Task.CompletedTask;
        }
        public Task<List<Institution>> GetAllInstitutionsAsync() => Task.FromResult(new List<Institution>());
        public Task<Institution?> GetInstitutionByIdAsync(Guid id) => Task.FromResult<Institution?>(null);
        public Task SaveChangesAsync() => Task.CompletedTask;
    }

    private static Credential ValidCredential(Guid userId, CredentialStatus status = CredentialStatus.Active)
    {
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId,
        };

        return new Credential
        {
            Id = Guid.NewGuid(),
            Status = status,
            Citizen = citizen,
            CitizenId = citizen.Id,
        };
    }

    private static QrService CreateService(Credential? credentialToReturn = null, List<Credential>? credentialsToReturn = null)
    {
        var fakeRepo = new FakeCredentialRepository
        {
            CredentialToReturn = credentialToReturn,
            CredentialsToReturn = credentialsToReturn ?? new List<Credential>(),
        };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var fakeQrDisclosureTokenRepo = new FakeQrDisclosureTokenRepository();
        var fakeInstitutionRepo = new FakeInstitutionRepository();

        return new QrService(fakeRepo, fakeSigningProvider, fakeQrDisclosureTokenRepo, fakeInstitutionRepo);
    }

    [Fact]
    public async Task GenerateQrAsync_ActiveCredentialOwnedByUser_ReturnsToken()
    {
        var userId = Guid.NewGuid();
        var credential = ValidCredential(userId);
        var qrService = CreateService(credential);

        var request = new GenerateQrRequestDto
        {
            DisclosedFields = new List<string>
           {
             "Full name", "SA ID number", "Photo", "License number",
             "License code", "Expiry date", "Country of issue",
           },
        };
        var result = await qrService.GenerateQrAsync(credential.Id, userId, request);

        Assert.False(string.IsNullOrEmpty(result.Token));
        Assert.True(result.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public async Task GenerateQrAsync_CredentialNotFound_ThrowsCredentialNotFoundException()
    {
        var qrService = CreateService();

        var request = new GenerateQrRequestDto { DisclosedFields = new List<string>() };

        await Assert.ThrowsAsync<CredentialNotFoundException>(
            () => qrService.GenerateQrAsync(Guid.NewGuid(), Guid.NewGuid(), request));
    }

    [Fact]
    public async Task GenerateQrAsync_CredentialOwnedByDifferentUser_ThrowsCredentialAccessDeniedException()
    {
        var ownerId = Guid.NewGuid();
        var requestingUserId = Guid.NewGuid();
        var credential = ValidCredential(ownerId);
        var qrService = CreateService(credential);

        var request = new GenerateQrRequestDto { DisclosedFields = new List<string>() };

        await Assert.ThrowsAsync<CredentialAccessDeniedException>(
            () => qrService.GenerateQrAsync(credential.Id, requestingUserId, request));
    }

    [Fact]
    public async Task GenerateQrAsync_CredentialNotActive_ThrowsCredentialNotActiveException()
    {
        var userId = Guid.NewGuid();
        var credential = ValidCredential(userId, CredentialStatus.Revoked);
        var qrService = CreateService(credential);

        var request = new GenerateQrRequestDto { DisclosedFields = new List<string>() };

        await Assert.ThrowsAsync<CredentialNotActiveException>(
            () => qrService.GenerateQrAsync(credential.Id, userId, request));
    }

    [Fact]
    public async Task GenerateQrAsync_UnknownFieldValue_ThrowsInvalidDisclosedFieldsException()
    {
        var userId = Guid.NewGuid();
        var credential = ValidCredential(userId);
        var qrService = CreateService(credential);

        var request = new GenerateQrRequestDto { DisclosedFields = new List<string> { "This is not a real field" } };

        await Assert.ThrowsAsync<InvalidDisclosedFieldsException>(() => qrService.GenerateQrAsync(credential.Id, userId, request));
    }

    [Fact]
    public async Task GenerateQrAsync_MissingMandatoryField_ThrowsInvalidDisclosedFieldsException()
    {
        var userId = Guid.NewGuid();
        var credential = ValidCredential(userId);
        var qrService = CreateService(credential);

        var request = new GenerateQrRequestDto { DisclosedFields = new List<string> { "Full name" } };

        await Assert.ThrowsAsync<InvalidDisclosedFieldsException>(() => qrService.GenerateQrAsync(credential.Id, userId, request));
    }

    [Fact]
    public async Task GetMyCredentialsAsync_OnlyReturnsActiveCredentials()
    {
        var userId = Guid.NewGuid();
        var activeCredential = ValidCredential(userId, CredentialStatus.Active);
        var revokedCredential = ValidCredential(userId, CredentialStatus.Revoked);
        var qrService = CreateService(credentialsToReturn: new List<Credential> { activeCredential, revokedCredential });

        var result = await qrService.GetMyCredentialsAsync(userId);

        Assert.Single(result);
        Assert.Equal(activeCredential.Id, result[0].Id);
    }
}