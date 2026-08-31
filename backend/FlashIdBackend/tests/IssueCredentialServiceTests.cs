using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.Citizens.Exceptions;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Enums;
using Application.Features.Credentials.Exceptions;
using Application.Features.Onboarding.Dtos;
using Application.Features.Onboarding.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class IssueCredentialServiceTests
{
    private const string KnownSaId = "9001015800086";
    private const string TestIpAddress = "196.25.1.10";

    private sealed class FakeGovernmentRegistryGateway : IGovernmentRegistryGateway
    {
        public GovernmentRegistryIdentityDocumentDto? IdToReturn { get; set; }
        public GovernmentRegistryDriversLicenseDto? DlToReturn { get; set; }
        public List<string> RequestedSaIds { get; } = new();

        public Task<CitizenRecordDto?> GetCitizenBySaIdAsync(string saId) => Task.FromResult<CitizenRecordDto?>(null);

        public Task<GovernmentRegistryIdentityDocumentDto?> GetIdentityDocumentBySaIdAsync(string saId, CancellationToken cancellationToken)
        {
            RequestedSaIds.Add(saId);

            return Task.FromResult(IdToReturn);
        }

        public Task<GovernmentRegistryDriversLicenseDto?> GetDriversLicenseBySaIdAsync(string saId, CancellationToken cancellationToken)
        {
            RequestedSaIds.Add(saId);

            return Task.FromResult(DlToReturn);
        }
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static IssueCredentialService CreateService(AppDbContext context, FakeGovernmentRegistryGateway gateway)
    {
        return new IssueCredentialService(
            new CredentialsActivationRepository(context),
            gateway,
            new CredentialMapper(),
            new CitizenMapper()
        );
    }

    private static GovernmentRegistryDriversLicenseDto KnownDriversLicense() => new()
    {
        Signature = "dl-sig",
        IssuedBy = "Road Traffic Management Corporation",
        IssueDate = new DateOnly(2020, 3, 15),
        LicenseNumber = "DL1234567",
        LicenseCode = "EB",
        Restrictions = "None",
        ExpiryDate = new DateOnly(2030, 3, 15),
        PhotoBlob = "dl-photo",
    };

    private static GovernmentRegistryIdentityDocumentDto KnownIdentityDocument() => new()
    {
        Signature = "id-sig",
        IssuedBy = "Department of Home Affairs",
        IssueDate = new DateOnly(2015, 6, 1),
        CountryOfBirth = "South Africa",
        CitizenshipStatus = "Citizen",
        Nationality = "South African",
        PhotoBlob = "id-photo",
    };

    private static async Task<Citizen> SeedActivatedCitizenAsync(AppDbContext context, bool withUser = true)
    {
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = KnownSaId,
            Names = "LeBron",
            Surname = "James",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Status = CitizenStatus.Activated,
            ActivatedAt = DateTime.UtcNow,
        };

        if (withUser)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "lebron.james@example.com",
                PhoneNumber = "+27123456789",
                PasswordHash = "hash",
                Role = UserRole.Citizen,
            };

            await context.DomainUsers.AddAsync(user);

            citizen.UserId = user.Id;
            citizen.User = user;
        }

        await context.Citizens.AddAsync(citizen);
        await context.SaveChangesAsync();

        return citizen;
    }

    [Fact]
    public async Task GetCitizenStatusAsync_InvalidSaId_ThrowsArgumentException()
    {
        using var context = CreateContext();
        var service = CreateService(context, new FakeGovernmentRegistryGateway());

        await Assert.ThrowsAsync<ArgumentException>(() => service.GetCitizenStatusAsync("12345", TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GetCitizenStatusAsync_UnknownSaId_ThrowsCitizenNotFoundException()
    {
        using var context = CreateContext();
        var service = CreateService(context, new FakeGovernmentRegistryGateway());

        await Assert.ThrowsAsync<CitizenNotFoundException>(() => service.GetCitizenStatusAsync(KnownSaId, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GetCitizenStatusAsync_ActivatedCitizenWithUser_ReturnsContactInfo()
    {
        using var context = CreateContext();
        await SeedActivatedCitizenAsync(context);
        var service = CreateService(context, new FakeGovernmentRegistryGateway());

        var response = await service.GetCitizenStatusAsync(KnownSaId, TestContext.Current.CancellationToken);

        Assert.Equal("Activated", response.Status);
        Assert.Equal("+27123456789", response.PhoneNumber);
        Assert.Equal("lebron.james@example.com", response.Email);
        Assert.Empty(response.ExistingCredentials);
    }

    [Fact]
    public async Task GetCitizenStatusAsync_ActivatedCitizenWithoutUser_ReturnsNullContactInfo()
    {
        using var context = CreateContext();
        await SeedActivatedCitizenAsync(context, withUser: false);
        var service = CreateService(context, new FakeGovernmentRegistryGateway());

        var response = await service.GetCitizenStatusAsync(KnownSaId, TestContext.Current.CancellationToken);

        Assert.Null(response.PhoneNumber);
        Assert.Null(response.Email);
    }

    [Fact]
    public async Task GetCitizenStatusAsync_CitizenWithExistingDriversLicense_ReturnsCredentialSummary()
    {
        using var context = CreateContext();
        var citizen = await SeedActivatedCitizenAsync(context);

        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Status = CredentialStatus.Active,
            Signature = "sig",
            IssuedBy = "RMTC",
            IssueDate = new DateTime(2020, 3, 15, 0, 0, 0, DateTimeKind.Utc),
            DriversLicense = new DriversLicense
            {
                Id = Guid.NewGuid(),
                LicenseNumber = "DL1234567",
                LicenseCode = LicenseCode.EB,
                Restrictions = "None",
                ExpiryDate = new DateTime(2030, 3, 15, 0, 0, 0, DateTimeKind.Utc),
                PhotoPath = "dl-photo",
            },
        };

        await context.Credentials.AddAsync(credential, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context, new FakeGovernmentRegistryGateway());
        var response = await service.GetCitizenStatusAsync(KnownSaId, TestContext.Current.CancellationToken);
        var summary = Assert.Single(response.ExistingCredentials);

        Assert.Equal("DriversLicense", summary.Type);
        Assert.Equal("Active", summary.Status);
    }

    [Fact]
    public async Task IssueCredentialAsync_ConsentNotGiven_ThrowsCitizenConsentRequiredExceptionAndLogsFailure()
    {
        using var context = CreateContext();
        var citizen = await SeedActivatedCitizenAsync(context);
        var gateway = new FakeGovernmentRegistryGateway { DlToReturn = KnownDriversLicense() };
        var service = CreateService(context, gateway);
        var request = new IssueCredentialRequestDto { SaId = KnownSaId, CredentialType = CredentialType.DriversLicense, ConsentGiven = false };
        var officialId = Guid.NewGuid();

        await Assert.ThrowsAsync<CitizenConsentRequiredException>(() => service.IssueCredentialAsync(request, officialId, TestIpAddress, TestContext.Current.CancellationToken));

        Assert.Empty(gateway.RequestedSaIds);
        Assert.Empty(context.Credentials);

        var log = Assert.Single(context.AuditLogs);

        Assert.Equal(AuditEventType.CredentialIssueFailed, log.EventType);
        Assert.Equal(officialId, log.ActorId);
    }

    [Fact]
    public async Task IssueCredentialAsync_InvalidSaId_ThrowsArgumentException()
    {
        using var context = CreateContext();
        var service = CreateService(context, new FakeGovernmentRegistryGateway());
        var request = new IssueCredentialRequestDto { SaId = "12345", CredentialType = CredentialType.DriversLicense, ConsentGiven = true };

        await Assert.ThrowsAsync<ArgumentException>(() => service.IssueCredentialAsync(request, Guid.NewGuid(), TestIpAddress, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task IssueCredentialAsync_CitizenNotFound_ThrowsCitizenNotFoundException()
    {
        using var context = CreateContext();
        var service = CreateService(context, new FakeGovernmentRegistryGateway());
        var request = new IssueCredentialRequestDto { SaId = KnownSaId, CredentialType = CredentialType.DriversLicense, ConsentGiven = true };

        await Assert.ThrowsAsync<CitizenNotFoundException>(() => service.IssueCredentialAsync(request, Guid.NewGuid(), TestIpAddress, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task IssueCredentialAsync_CitizenNotActivated_ThrowsCitizenNotOnboardedException()
    {
        using var context = CreateContext();

        await context.Citizens.AddAsync(new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = KnownSaId,
            Names = "Test",
            Surname = "Test",
            Status = CitizenStatus.Pending,
        }, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context, new FakeGovernmentRegistryGateway());
        var request = new IssueCredentialRequestDto { SaId = KnownSaId, CredentialType = CredentialType.DriversLicense, ConsentGiven = true };

        await Assert.ThrowsAsync<CitizenNotOnboardedException>(() => service.IssueCredentialAsync(request, Guid.NewGuid(), TestIpAddress, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task IssueCredentialAsync_AlreadyHasActivatedDriversLicense_ThrowsCredentialAlreadyIssuedExceptionAndLogsFailure()
    {
        using var context = CreateContext();
        var citizen = await SeedActivatedCitizenAsync(context);

        var existing = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Status = CredentialStatus.Active,
            Signature = "sig",
            IssuedBy = "RMTC",
            IssueDate = DateTime.UtcNow,
            DriversLicense = new DriversLicense
            {
                Id = Guid.NewGuid(),
                LicenseNumber = "DL1234567",
                LicenseCode = LicenseCode.EB,
                Restrictions = "None",
                ExpiryDate = DateTime.UtcNow.AddYears(5),
                PhotoPath = "dl-photo",
            },
        };

        await context.Credentials.AddAsync(existing, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var gateway = new FakeGovernmentRegistryGateway { DlToReturn = KnownDriversLicense() };
        var service = CreateService(context, gateway);
        var request = new IssueCredentialRequestDto { SaId = KnownSaId, CredentialType = CredentialType.DriversLicense, ConsentGiven = true };
        var officialId = Guid.NewGuid();

        await Assert.ThrowsAsync<CredentialAlreadyIssuedException>(() => service.IssueCredentialAsync(request, officialId, TestIpAddress, TestContext.Current.CancellationToken));

        Assert.Empty(gateway.RequestedSaIds);

        var log = Assert.Single(context.AuditLogs);

        Assert.Equal(AuditEventType.CredentialIssueFailed, log.EventType);
    }

    [Fact]
    public async Task IssueCredentialAsync_RegistryReturnsNull_ThrowsGovernmentRegistryRecordNotFoundException()
    {
        using var context = CreateContext();

        await SeedActivatedCitizenAsync(context);

        var gateway = new FakeGovernmentRegistryGateway { DlToReturn = null };
        var service = CreateService(context, gateway);
        var request = new IssueCredentialRequestDto { SaId = KnownSaId, CredentialType = CredentialType.DriversLicense, ConsentGiven = true };

        await Assert.ThrowsAsync<GovernmentRegistryRecordNotFoundException>(() => service.IssueCredentialAsync(request, Guid.NewGuid(), TestIpAddress, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task IssueCredentialAsync_DriversLicenseHappyPath_PersistsCredentialAndRetursMappedDto()
    {
        using var context = CreateContext();
        var citizen = await SeedActivatedCitizenAsync(context);
        var gateway = new FakeGovernmentRegistryGateway { DlToReturn = KnownDriversLicense() };
        var service = CreateService(context, gateway);
        var request = new IssueCredentialRequestDto { SaId = KnownSaId, CredentialType = CredentialType.DriversLicense, ConsentGiven = true };
        var officialId = Guid.NewGuid();
        var response = await service.IssueCredentialAsync(request, officialId, TestIpAddress, TestContext.Current.CancellationToken);

        Assert.Equal("DriversLicense", response.Type);
        Assert.Equal("Driver's Licence", response.Title);
        Assert.Equal("Active", response.Status);
        Assert.Equal("Road Traffic Management Corporation", response.IssuedBy);
        Assert.NotNull(response.DriversLicense);
        Assert.Equal("DL1234567", response.DriversLicense!.LicenseNumber);

        var saved = Assert.Single(context.Credentials);

        Assert.Equal(citizen.Id, saved.CitizenId);
    }

    [Fact]
    public async Task IssueCredentialAsync_IdentityDocumentHappyPath_PersistsCredentialAndRetursMappedDto()
    {
        using var context = CreateContext();
        var citizen = await SeedActivatedCitizenAsync(context);
        var gateway = new FakeGovernmentRegistryGateway { IdToReturn = KnownIdentityDocument() };
        var service = CreateService(context, gateway);
        var request = new IssueCredentialRequestDto { SaId = KnownSaId, CredentialType = CredentialType.IdentityDocument, ConsentGiven = true };
        var officialId = Guid.NewGuid();
        var response = await service.IssueCredentialAsync(request, officialId, TestIpAddress, TestContext.Current.CancellationToken);

        Assert.Equal("IdentityDocument", response.Type);
        Assert.Equal("National ID Card", response.Title);
        Assert.NotNull(response.IdentityDocument);
        Assert.Equal(KnownSaId, response.IdentityDocument!.IdNumber);

        var saved = Assert.Single(context.Credentials);

        Assert.Equal(citizen.Id, saved.CitizenId);
    }

    [Fact]
    public async Task IssueCredentialAsync_HappyPath_WritesConsentAndIssuedAuditLogsAndNotification()
    {
        using var context = CreateContext();
        var citizen = await SeedActivatedCitizenAsync(context);
        var gateway = new FakeGovernmentRegistryGateway { DlToReturn = KnownDriversLicense() };
        var service = CreateService(context, gateway);
        var request = new IssueCredentialRequestDto { SaId = KnownSaId, CredentialType = CredentialType.DriversLicense, ConsentGiven = true };
        var officialId = Guid.NewGuid();
        await service.IssueCredentialAsync(request, officialId, TestIpAddress, TestContext.Current.CancellationToken);

        Assert.Equal(2, context.AuditLogs.Count());
        Assert.Contains(context.AuditLogs, l => l.EventType == AuditEventType.ConsentRecorded && l.Details.Contains("DriversLicense"));
        Assert.Contains(context.AuditLogs, l => l.EventType == AuditEventType.CredentialIssued);

        var notification = Assert.Single(context.Notifications);

        Assert.Equal(citizen.Id, notification.CitizenId);
        Assert.Equal("Success", notification.Tone);
    }
}