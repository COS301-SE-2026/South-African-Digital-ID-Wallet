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

        public Citizen? CitizenToReturn { get; set; }

        public Task<Credential?> GetByIdAsync(Guid id) => Task.FromResult(CredentialToReturn);
        public Task<List<Credential>> GetByUserIdAsync(Guid userId) => Task.FromResult(CredentialsToReturn);
        public Task<Citizen?> GetCitizenByUserIdAsync(Guid userId) => Task.FromResult(CitizenToReturn);
        public Task<List<Credential>> GetCredentialsByCitizenIdAsync(Guid citizenId) => Task.FromResult(CredentialsToReturn);
    }

    private class FakeQrSigningProvider : IQrSigningProvider
    {
        public string Sign(string payload) => "fake-signature";
        public bool Verify(string payload, string signature) => true;
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

    [Fact]
    public async Task GenerateQrAsync_ActiveCredentialOwnedByUser_ReturnsToken()
    {
        var userId = Guid.NewGuid();
        var credential = ValidCredential(userId);
        var fakeRepository = new FakeCredentialRepository { CredentialToReturn = credential };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var qrService = new QrService(fakeRepository, fakeSigningProvider);

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
        var fakeRepository = new FakeCredentialRepository { CredentialToReturn = null };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var qrService = new QrService(fakeRepository, fakeSigningProvider);

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
        var fakeRepository = new FakeCredentialRepository { CredentialToReturn = credential };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var qrService = new QrService(fakeRepository, fakeSigningProvider);

        var request = new GenerateQrRequestDto { DisclosedFields = new List<string>() };

        await Assert.ThrowsAsync<CredentialAccessDeniedException>(
            () => qrService.GenerateQrAsync(credential.Id, requestingUserId, request));
    }

    [Fact]
    public async Task GenerateQrAsync_CredentialNotActive_ThrowsCredentialNotActiveException()
    {
        var userId = Guid.NewGuid();
        var credential = ValidCredential(userId, CredentialStatus.Revoked);
        var fakeRepository = new FakeCredentialRepository { CredentialToReturn = credential };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var qrService = new QrService(fakeRepository, fakeSigningProvider);

        var request = new GenerateQrRequestDto { DisclosedFields = new List<string>() };

        await Assert.ThrowsAsync<CredentialNotActiveException>(
            () => qrService.GenerateQrAsync(credential.Id, userId, request));
    }

    [Fact]
    public async Task GetMyCredentialsAsync_OnlyReturnsActiveCredentials()
    {
        var userId = Guid.NewGuid();
        var activeCredential = ValidCredential(userId, CredentialStatus.Active);
        var revokedCredential = ValidCredential(userId, CredentialStatus.Revoked);
        var fakeRepository = new FakeCredentialRepository
        {
            CredentialsToReturn = new List<Credential> { activeCredential, revokedCredential },
        };
        var fakeSigningProvider = new FakeQrSigningProvider();
        var qrService = new QrService(fakeRepository, fakeSigningProvider);

        var result = await qrService.GetMyCredentialsAsync(userId);

        Assert.Single(result);
        Assert.Equal(activeCredential.Id, result[0].Id);
    }
}