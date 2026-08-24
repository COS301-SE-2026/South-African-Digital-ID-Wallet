using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class CredentialServiceIntegrationTests
{
    private const string LocalHostIp = "127.0.0.1";

    private static AppDbContext CreateContext()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    private static CredentialService CreateCredentialService(AppDbContext context)
    {
        return new CredentialService(
            new CredentialRepository(context),
            new NotificationRepository(context),
            new InstitutionRepository(context),
            new CredentialMapper()
        );
    }

    private static (User User, Citizen Citizen) CreateCitizenWithUser()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "palesa.mokoena@example.com",
            PhoneNumber = "0821234567",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPwd123!"), // NOSONAR -(NOTE to team: we put this to tell Sonars Scanner we know this looks like a secret but its not really one, don't flag it)
            PasswordSet = true,
            IsDeleted = false,
            IsEmailVerified = true,
            Role = UserRole.Citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = "9001015800083",
            Names = "Palesa",
            Surname = "Mokoena",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Status = CitizenStatus.Activated,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        return (user, citizen);
    }

    private static Credential BuildCredential(Citizen c, CredentialStatus status = CredentialStatus.Active) => new()
    {
        Id = Guid.NewGuid(),
        Status = status,
        Signature = string.Empty,
        IssuedBy = "Home Affairs",
        IssueDate = DateTime.UtcNow,
        CitizenId = c.Id,
        Citizen = c,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
    };

    private static async Task<(User User, Citizen Citizen, Credential Credential, GovernmentAdministrator Admin)> SeedAsync(
        AppDbContext context, CredentialStatus status = CredentialStatus.Active)
    {
        var (user, citizen) = CreateCitizenWithUser();
        var credential = BuildCredential(citizen, status);

        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "anele.dlamini@flashid.gov.za",
            PhoneNumber = "0820000000",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPwd123!"), // NOSONAR - test-only dummy credential, not a real secret
            PasswordSet = true,
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
            UserId = adminUser.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await context.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.Credentials.AddAsync(credential, TestContext.Current.CancellationToken);
        await context.DomainUsers.AddAsync(adminUser, TestContext.Current.CancellationToken);
        await context.GovernmentAdministrators.AddAsync(admin, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        return (user, citizen, credential, admin);
    }

    [Fact]
    public async Task RevokeCredentialAsync_ValidRevoke_UpdatesStatusWritesAuditLogAndNotifiesCitizen()
    {
        using var context = CreateContext();
        var service = CreateCredentialService(context);
        var (_, citizen, credential, admin) = await SeedAsync(context);

        var request = new RevokeCredentialRequestDto
        {
            NewStatus = CredentialStatus.Revoked,
            Reason = "Suspected forgery flagged during routine audit.",
        };

        var result = await service.RevokeCredentialAsync(credential.Id, admin.UserId, request, LocalHostIp);

        var storedCredential = await context.Credentials.FirstAsync(c => c.Id == credential.Id, TestContext.Current.CancellationToken);
        var auditLog = await context.AuditLogs.SingleAsync(TestContext.Current.CancellationToken);
        var notification = await context.Notifications.SingleAsync(TestContext.Current.CancellationToken);

        Assert.Equal(CredentialStatus.Revoked, result.Status);
        Assert.Equal(CredentialStatus.Revoked, storedCredential.Status);
        Assert.Equal(AuditEventType.CredentialRevoked, auditLog.EventType);
        Assert.Equal(admin.UserId, auditLog.ActorId);
        Assert.Equal(LocalHostIp, auditLog.IpAddress);
        Assert.Contains("Suspected forgery", auditLog.Details);
        Assert.Equal(citizen.Id, notification.CitizenId);
        Assert.Equal("warning", notification.Tone);
    }

    [Fact]
    public async Task RevokeCredentialAsync_ValidInvestigation_UpdatesStatusWritesAuditLogAndNotifiesCitizen()
    {
        using var context = CreateContext();
        var service = CreateCredentialService(context);
        var (_, citizen, credential, admin) = await SeedAsync(context);

        var request = new RevokeCredentialRequestDto
        {
            NewStatus = CredentialStatus.Investigation,
            Reason = "Flagged for investigation pending review.",
        };

        var result = await service.RevokeCredentialAsync(credential.Id, admin.UserId, request, LocalHostIp);

        var storedCredential = await context.Credentials.FirstAsync(c => c.Id == credential.Id, TestContext.Current.CancellationToken);
        var notification = await context.Notifications.SingleAsync(TestContext.Current.CancellationToken);

        Assert.Equal(CredentialStatus.Investigation, result.Status);
        Assert.Equal(CredentialStatus.Investigation, storedCredential.Status);
        Assert.Equal(citizen.Id, notification.CitizenId);
    }

    [Fact]
    public async Task RevokeCredentialAsync_CredentialNotFound_ThrowsAndPersistsNothing()
    {
        using var context = CreateContext();
        var service = CreateCredentialService(context);
        var admin = (await SeedAsync(context)).Admin;

        var request = new RevokeCredentialRequestDto { NewStatus = CredentialStatus.Revoked, Reason = "test" };

        await Assert.ThrowsAsync<CredentialNotFoundException>(
            () => service.RevokeCredentialAsync(Guid.NewGuid(), admin.UserId, request, LocalHostIp));

        Assert.Empty(context.AuditLogs);
        Assert.Empty(context.Notifications);
    }

    [Fact]
    public async Task RevokeCredentialAsync_AlreadyInTargetStatus_ThrowsAndDoesNotDuplicateSideEffects()
    {
        using var context = CreateContext();
        var service = CreateCredentialService(context);
        var (_, _, credential, admin) = await SeedAsync(context, CredentialStatus.Revoked);

        var request = new RevokeCredentialRequestDto { NewStatus = CredentialStatus.Revoked, Reason = "Duplicate attempt" };

        await Assert.ThrowsAsync<InvalidCredentialStatusTransitionException>(
            () => service.RevokeCredentialAsync(credential.Id, admin.UserId, request, LocalHostIp));

        Assert.Empty(context.AuditLogs);
        Assert.Empty(context.Notifications);
    }

    [Fact]
    public async Task RevokeCredentialAsync_DisallowedTargetStatus_ThrowsAndDoesNotChangeStatus()
    {
        using var context = CreateContext();
        var service = CreateCredentialService(context);
        var (_, _, credential, admin) = await SeedAsync(context);

        var request = new RevokeCredentialRequestDto { NewStatus = CredentialStatus.Active, Reason = "test" };

        await Assert.ThrowsAsync<InvalidCredentialStatusTransitionException>(
            () => service.RevokeCredentialAsync(credential.Id, admin.UserId, request, LocalHostIp));

        var storedCredential = await context.Credentials.FirstAsync(c => c.Id == credential.Id, TestContext.Current.CancellationToken);
        Assert.Equal(CredentialStatus.Active, storedCredential.Status);
    }
}