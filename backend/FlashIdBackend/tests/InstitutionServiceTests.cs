using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Institutions.DTOs;
using Application.Features.Institutions.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class InstitutionServiceTests
{
    private class FakeInstitutionRepository : IInstitutionRepository
    {
        public GovernmentAdministrator? AdminToReturn { get; set; }
        public bool InstitutionExists { get; set; }
        public Institution? InstitutionToReturn { get; set; }
        public List<Institution> InstitutionsToReturn { get; set; } = new();
        public List<AuditLog> SavedAuditLogs { get; } = new();
        public bool SaveChangesCalled { get; private set; }

        public Task<GovernmentAdministrator?> GetAdminByIdAsync(Guid adminId) => Task.FromResult(AdminToReturn);

        public Task<bool> InstitutionExistsByVerificationNumberAsync(string verificationNumber) =>
            Task.FromResult(InstitutionExists);

        public Task AddInstitutionAsync(Institution institution)
        {
            InstitutionToReturn = institution;
            return Task.CompletedTask;
        }

        public Task AddAuditLogAsync(AuditLog auditLog)
        {
            SavedAuditLogs.Add(auditLog);
            return Task.CompletedTask;
        }

        public Task<List<Institution>> GetAllInstitutionsAsync() => Task.FromResult(InstitutionsToReturn);

        public Task<Institution?> GetInstitutionByIdAsync(Guid id) => Task.FromResult(InstitutionToReturn);

        public Task SaveChangesAsync()
        {
            SaveChangesCalled = true;
            return Task.CompletedTask;
        }
    }

    private class FakeEmailSenderProvider : IEmailSenderProvider
    {
        public string? LastToEmail { get; private set; }
        public string? LastSubject { get; private set; }
        public string? LastMessage { get; private set; }
        public int SendCount { get; private set; }

        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default)
        {
            LastToEmail = toEmail;
            LastSubject = subject;
            LastMessage = message;
            SendCount++;
            return Task.CompletedTask;
        }
    }

    private static Institution ValidInstitution(string apiKeyHash = "old-hash")
    {
        return new Institution
        {
            Id = Guid.NewGuid(),
            Name = "Test Home Affairs Office",
            Type = InstitutionType.HomeAffairs,
            VerificationNumber = "VN123456",
            ContactEmail = "contact@testhomeaffairs.co.za",
            ApiKeyReference = Guid.NewGuid(),
            ApiKeyHash = apiKeyHash,
            RegisteredById = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
    }

    [Fact]
    public async Task RegenerateApiKeyAsync_InstitutionExists_ReturnsNewKeyAndUpdatesHash()
    {
        var institution = ValidInstitution();
        var originalHash = institution.ApiKeyHash;
        var fakeRepository = new FakeInstitutionRepository { InstitutionToReturn = institution };
        var fakeEmailSender = new FakeEmailSenderProvider();
        var mapper = new InstitutionMapper();
        var adminId = Guid.NewGuid();
        var service = new InstitutionService(fakeRepository, mapper, fakeEmailSender);

        var result = await service.RegenerateApiKeyAsync(institution.Id, adminId);

        Assert.False(string.IsNullOrEmpty(result.ApiKey));
        Assert.Equal(institution.Id, result.InstitutionId);
        Assert.NotEqual(originalHash, institution.ApiKeyHash);
    }

    [Fact]
    public async Task RegenerateApiKeyAsync_InstitutionExists_SavesChanges()
    {
        var institution = ValidInstitution();
        var fakeRepository = new FakeInstitutionRepository { InstitutionToReturn = institution };
        var fakeEmailSender = new FakeEmailSenderProvider();
        var mapper = new InstitutionMapper();
        var service = new InstitutionService(fakeRepository, mapper, fakeEmailSender);

        await service.RegenerateApiKeyAsync(institution.Id, Guid.NewGuid());

        Assert.True(fakeRepository.SaveChangesCalled);
    }

    [Fact]
    public async Task RegenerateApiKeyAsync_InstitutionExists_WritesAuditLogWithCorrectEventType()
    {
        var institution = ValidInstitution();
        var fakeRepository = new FakeInstitutionRepository { InstitutionToReturn = institution };
        var fakeEmailSender = new FakeEmailSenderProvider();
        var mapper = new InstitutionMapper();
        var adminId = Guid.NewGuid();
        var service = new InstitutionService(fakeRepository, mapper, fakeEmailSender);

        await service.RegenerateApiKeyAsync(institution.Id, adminId);

        var auditLog = Assert.Single(fakeRepository.SavedAuditLogs);
        Assert.Equal(AuditEventType.InstitutionApiKeyRegenerated, auditLog.EventType);
        Assert.Equal(adminId, auditLog.ActorId);
    }

    [Fact]
    public async Task RegenerateApiKeyAsync_InstitutionExists_SendsEmailToContactAddress()
    {
        var institution = ValidInstitution();
        var fakeRepository = new FakeInstitutionRepository { InstitutionToReturn = institution };
        var fakeEmailSender = new FakeEmailSenderProvider();
        var mapper = new InstitutionMapper();
        var service = new InstitutionService(fakeRepository, mapper, fakeEmailSender);

        await service.RegenerateApiKeyAsync(institution.Id, Guid.NewGuid());

        Assert.Equal(1, fakeEmailSender.SendCount);
        Assert.Equal(institution.ContactEmail, fakeEmailSender.LastToEmail);
    }

    [Fact]
    public async Task RegenerateApiKeyAsync_InstitutionNotFound_ThrowsInvalidInstitutionRequestException()
    {
        var fakeRepository = new FakeInstitutionRepository { InstitutionToReturn = null };
        var fakeEmailSender = new FakeEmailSenderProvider();
        var mapper = new InstitutionMapper();
        var service = new InstitutionService(fakeRepository, mapper, fakeEmailSender);

        await Assert.ThrowsAsync<InvalidInstitutionRequestException>(
            () => service.RegenerateApiKeyAsync(Guid.NewGuid(), Guid.NewGuid()));
    }

    [Fact]
    public async Task RegenerateApiKeyAsync_InstitutionNotFound_DoesNotSendEmail()
    {
        var fakeRepository = new FakeInstitutionRepository { InstitutionToReturn = null };
        var fakeEmailSender = new FakeEmailSenderProvider();
        var mapper = new InstitutionMapper();
        var service = new InstitutionService(fakeRepository, mapper, fakeEmailSender);

        await Assert.ThrowsAsync<InvalidInstitutionRequestException>(
            () => service.RegenerateApiKeyAsync(Guid.NewGuid(), Guid.NewGuid()));

        Assert.Equal(0, fakeEmailSender.SendCount);
    }
}