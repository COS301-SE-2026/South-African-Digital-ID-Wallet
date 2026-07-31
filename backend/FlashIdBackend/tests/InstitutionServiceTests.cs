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
            new InstitutionMapper()
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