using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Institutions.DTOs;
using Application.Features.Institutions.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Repositories;

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
        public Task<List<Institution>> GetInstitutionsWithApiKeyOlderThanAsync(DateTime threshold) =>
            Task.FromResult(InstitutionsToReturn.Where(i => i.ApiKeyGeneratedAt < threshold).ToList());

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
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static InstitutionService CreateService(AppDbContext context)
    {
        return new InstitutionService(
            new InstitutionRepository(context),
            new InstitutionMapper(),
            new FakeEmailSenderProvider()
        );
    }

    private static (User User, GovernmentAdministrator Admin) CreateAdmin()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = $"admin-{Guid.NewGuid()}@flashid.gov.za",
            PhoneNumber = "0820000000",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPwd123!"),
            PasswordSet = true,
            FailedLoginAttempts = 0,
            IsDeleted = false,
            IsEmailVerified = true,
            Role = UserRole.GovernmentAdministrator,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var admin = new GovernmentAdministrator
        {
            Id = Guid.NewGuid(),
            GovernmentId = "GOV-ADM-001",
            Names = "Anele",
            Surname = "Dlamini",
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        return (user, admin);
    }

    private static RegisterInstitutionRequestDto ValidRequest(Guid adminId) => new()
    {
        Name = "Home Affairs JHB",
        Type = InstitutionType.HomeAffairs,
        VerificationNumber = "HA-JHB-001",
        AdminId = adminId,
        ContactEmail = "contact@homeaffairs-jhb.gov.za",
    };

    [Fact]
    public async Task RegisterInstitutionAsync_ValidRequest_CreatesInstitutionAndAuditLog()
    {
        using var context = CreateContext();
        var (user, admin) = CreateAdmin();
        context.DomainUsers.Add(user);
        context.GovernmentAdministrators.Add(admin);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = await service.RegisterInstitutionAsync(ValidRequest(admin.Id));

        Assert.NotNull(result);
        Assert.Equal("Home Affairs JHB", result.Name);
        Assert.Equal("HA-JHB-001", result.VerificationNumber);
        Assert.NotEmpty(result.ApiKey);
        Assert.NotEqual(Guid.Empty, result.ApiKeyReference);

        var savedInstitution = await context.Institutions.FirstOrDefaultAsync(i => i.VerificationNumber == "HA-JHB-001", TestContext.Current.CancellationToken);
        Assert.NotNull(savedInstitution);

        var savedAuditLog = await context.AuditLogs.FirstOrDefaultAsync(a => a.EventType == AuditEventType.InstitutionRegistered, TestContext.Current.CancellationToken);
        Assert.NotNull(savedAuditLog);
    }

    [Fact]
    public async Task RegisterInstitutionAsync_AdminDoesNotExist_ThrowsAdminNotFoundException()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        await Assert.ThrowsAsync<AdminNotFoundException>(
            () => service.RegisterInstitutionAsync(ValidRequest(Guid.NewGuid())));
    }

    [Fact]
    public async Task RegisterInstitutionAsync_VerificationNumberAlreadyExists_ThrowsInstitutionAlreadyExistsException()
    {
        using var context = CreateContext();
        var (user, admin) = CreateAdmin();
        context.DomainUsers.Add(user);
        context.GovernmentAdministrators.Add(admin);

        var existingInstitution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = "Existing Institution",
            Type = InstitutionType.HomeAffairs,
            VerificationNumber = "HA-JHB-001",
            ApiKeyReference = Guid.NewGuid(),
            RegisteredById = admin.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        context.Institutions.Add(existingInstitution);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        await Assert.ThrowsAsync<InstitutionAlreadyExistsException>(
            () => service.RegisterInstitutionAsync(ValidRequest(admin.Id)));
    }

    [Fact]
    public async Task GetAllInstitutionsAsync_NoInstitutions_ReturnsEmpty()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.GetAllInstitutionsAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetAllInstitutionsAsync_ReturnsMappedInstitutions()
    {
        using var context = CreateContext();
        var (user, admin) = CreateAdmin();
        context.DomainUsers.Add(user);
        context.GovernmentAdministrators.Add(admin);

        var institution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = "Home Affairs JHB",
            Type = InstitutionType.HomeAffairs,
            VerificationNumber = "HA-JHB-001",
            ApiKeyReference = Guid.NewGuid(),
            RegisteredById = admin.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        context.Institutions.Add(institution);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = await service.GetAllInstitutionsAsync();

        Assert.Single(result);
        Assert.Equal("Home Affairs JHB", result.First().Name);
    }

    [Fact]
    public async Task GetInstitutionByIdAsync_InstitutionExists_ReturnsMappedInstitution()
    {
        using var context = CreateContext();
        var (user, admin) = CreateAdmin();
        context.DomainUsers.Add(user);
        context.GovernmentAdministrators.Add(admin);

        var institution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = "Home Affairs JHB",
            Type = InstitutionType.HomeAffairs,
            VerificationNumber = "HA-JHB-001",
            ApiKeyReference = Guid.NewGuid(),
            RegisteredById = admin.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        context.Institutions.Add(institution);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = await service.GetInstitutionByIdAsync(institution.Id);

        Assert.NotNull(result);
        Assert.Equal("Home Affairs JHB", result.Name);
        Assert.Equal(institution.Id, result.InstitutionId);
    }

    [Fact]
    public async Task GetInstitutionByIdAsync_InstitutionDoesNotExist_ThrowsInvalidInstitutionRequestException()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        await Assert.ThrowsAsync<InvalidInstitutionRequestException>(
            () => service.GetInstitutionByIdAsync(Guid.NewGuid()));

    }
}