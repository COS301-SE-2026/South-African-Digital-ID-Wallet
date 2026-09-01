using Application.Common.Mapping;
using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;

namespace tests;

public class CredentialServiceTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static CredentialService CreateService(AppDbContext context)
    {
        return new CredentialService(
            new CredentialRepository(context),
            new NotificationRepository(context),
            new InstitutionRepository(context),
            new CredentialMapper()
        );
    }

    [Fact]
    public async Task GetMyCredentialsAsync_NoCitizen_ReturnsEmpty()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.GetMyCredentialsAsync(Guid.NewGuid());

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetMyCredentialsAsync_MapsStatusAndTypeCorrectly()
    {
        using var context = CreateContext();

        var userId = Guid.NewGuid();
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Names = "Logan",
            Surname = "Dlamini",
        };

        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Status = CredentialStatus.Active,
            Signature = "sig",
            IssuedBy = "Department of Home Affairs",
            IssueDate = new DateTime(2024, 2, 12, 0, 0, 0, DateTimeKind.Utc),
            IdentityDocument = new IdentityDocument
            {
                Id = Guid.NewGuid(),
                Nationality = "South African",
                Citizenship = "South African",
                CountryOfBirth = "South Africa",
                Status = IdentityDocumentStatus.Citizen,
            },
        };

        await context.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.Credentials.AddAsync(credential, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = (await service.GetMyCredentialsAsync(userId)).ToList();

        Assert.Single(result);
        Assert.Equal("IdentityDocument", result[0].Type);
        Assert.Equal("National ID Card", result[0].Title);
        Assert.Equal("Active", result[0].Status);
        Assert.Equal("South African", result[0].IdentityDocument!.Nationality);
    }

    private static (Citizen Citizen, Credential Credential) SeedCredential(AppDbContext context, CredentialStatus status = CredentialStatus.Active)
    {
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Names = "Sipho",
            Surname = "Nkosi",
        };
        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Status = status,
            Signature = "sig",
            IssuedBy = "Department of Home Affairs",
            IssueDate = DateTime.UtcNow,
        };
        context.Citizens.Add(citizen);
        context.Credentials.Add(credential);
        context.SaveChanges();
        return (citizen, credential);
    }

    [Fact]
    public async Task RevokeCredentialAsync_ValidRevoke_UpdatesStatus()
    {
        using var context = CreateContext();
        var (_, credential) = SeedCredential(context);
        var service = CreateService(context);

        var result = await service.RevokeCredentialAsync(
            credential.Id,
            Guid.NewGuid(),
            new RevokeCredentialRequestDto { NewStatus = CredentialStatus.Revoked, Reason = "Suspected forgery" },
            "127.0.0.1"
        );

        Assert.Equal(credential.Id, result.CredentialId);
        Assert.Equal(CredentialStatus.Revoked, result.Status);
    }

    [Fact]
    public async Task RevokeCredentialAsync_ValidInvestigation_UpdatesStatus()
    {
        using var context = CreateContext();
        var (_, credential) = SeedCredential(context);
        var service = CreateService(context);

        var result = await service.RevokeCredentialAsync(
            credential.Id,
            Guid.NewGuid(),
            new RevokeCredentialRequestDto { NewStatus = CredentialStatus.Investigation, Reason = "Under review" },
            "127.0.0.1"
        );

        Assert.Equal(CredentialStatus.Investigation, result.Status);
    }

    [Fact]
    public async Task RevokeCredentialAsync_CredentialNotFound_ThrowsCredentialNotFoundException()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        await Assert.ThrowsAsync<CredentialNotFoundException>(() =>
            service.RevokeCredentialAsync(
                Guid.NewGuid(),
                Guid.NewGuid(),
                new RevokeCredentialRequestDto { NewStatus = CredentialStatus.Revoked, Reason = "test" },
                "127.0.0.1"
            ));
    }

    [Fact]
    public async Task RevokeCredentialAsync_DisallowedTargetStatus_ThrowsInvalidCredentialStatusTransitionException()
    {
        using var context = CreateContext();
        var (_, credential) = SeedCredential(context);
        var service = CreateService(context);

        await Assert.ThrowsAsync<InvalidCredentialStatusTransitionException>(() =>
            service.RevokeCredentialAsync(
                credential.Id,
                Guid.NewGuid(),
                new RevokeCredentialRequestDto { NewStatus = CredentialStatus.Active, Reason = "test" },
                "127.0.0.1"
            ));
    }

    [Fact]
    public async Task RevokeCredentialAsync_AlreadyInTargetStatus_ThrowsInvalidCredentialStatusTransitionException()
    {
        using var context = CreateContext();
        var (_, credential) = SeedCredential(context, CredentialStatus.Revoked);
        var service = CreateService(context);

        await Assert.ThrowsAsync<InvalidCredentialStatusTransitionException>(() =>
            service.RevokeCredentialAsync(
                credential.Id,
                Guid.NewGuid(),
                new RevokeCredentialRequestDto { NewStatus = CredentialStatus.Revoked, Reason = "test" },
                "127.0.0.1"
            ));
    }
    private static Citizen SeedCitizen(AppDbContext context, string names, string surname, string saId, DriversLicense? driversLicense = null)
    {
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Names = names,
            Surname = surname,
            SaId = saId,
            ActivatedAt = DateTime.UtcNow,
        };
        context.Citizens.Add(citizen);

        if (driversLicense != null)
        {
            var credential = new Credential
            {
                Id = Guid.NewGuid(),
                CitizenId = citizen.Id,
                Status = CredentialStatus.Active,
                Signature = "sig",
                IssuedBy = "RTMC",
                IssueDate = DateTime.UtcNow,
                DriversLicense = driversLicense,
            };
            context.Credentials.Add(credential);
        }

        context.SaveChanges();
        return citizen;
    }

    [Fact]
    public async Task SearchCitizensAsync_MatchingQuery_ReturnsFilteredResults()
    {
        using var context = CreateContext();
        SeedCitizen(context, "Sipho", "Nkosi", "9001015800086");
        SeedCitizen(context, "Thandiwe", "Mokoena", "8505124800081");
        var service = CreateService(context);

        var result = await service.SearchCitizensAsync("Sipho", 1, 15);

        Assert.Single(result.Results);
        Assert.Equal("Sipho", result.Results[0].FirstName);
        Assert.Equal(1, result.TotalResults);
    }

    [Fact]
    public async Task SearchCitizensAsync_EmptyQuery_ReturnsAllCitizens()
    {
        using var context = CreateContext();
        SeedCitizen(context, "Sipho", "Nkosi", "9001015800086");
        SeedCitizen(context, "Thandiwe", "Mokoena", "8505124800081");
        var service = CreateService(context);

        var result = await service.SearchCitizensAsync(null, 1, 15);

        Assert.Equal(2, result.TotalResults);
        Assert.Equal(2, result.Results.Count);
    }

    [Fact]
    public async Task SearchCitizensAsync_CitizenWithDriversLicense_ReturnsExpiresOn()
    {
        using var context = CreateContext();
        var expiry = new DateTime(2030, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        SeedCitizen(context, "Sipho", "Nkosi", "9001015800086", new DriversLicense
        {
            Id = Guid.NewGuid(),
            LicenseNumber = "1234567890123",
            LicenseCode = LicenseCode.EB,
            Restrictions = "None",
            ExpiryDate = expiry,
        });
        var service = CreateService(context);

        var result = await service.SearchCitizensAsync("Sipho", 1, 15);

        Assert.Equal(expiry, result.Results[0].ExpiresOn);
    }

    [Fact]
    public async Task SearchCitizensAsync_CitizenWithoutDriversLicense_ReturnsNullExpiresOn()
    {
        using var context = CreateContext();
        SeedCitizen(context, "Sipho", "Nkosi", "9001015800086");
        var service = CreateService(context);

        var result = await service.SearchCitizensAsync("Sipho", 1, 15);

        Assert.Null(result.Results[0].ExpiresOn);
    }

    [Fact]
    public async Task GetCredentialsForCitizenAsync_ExistingCitizen_ReturnsCredentials()
    {
        using var context = CreateContext();
        var citizen = SeedCitizen(context, "Sipho", "Nkosi", "9001015800086");
        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Status = CredentialStatus.Active,
            Signature = "sig",
            IssuedBy = "Department of Home Affairs",
            IssueDate = DateTime.UtcNow,
            IdentityDocument = new IdentityDocument
            {
                Id = Guid.NewGuid(),
                Nationality = "South African",
                Citizenship = "South African",
                CountryOfBirth = "South Africa",
                Status = IdentityDocumentStatus.Citizen,
            },
        };
        context.Credentials.Add(credential);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        var service = CreateService(context);

        var result = (await service.GetCredentialsForCitizenAsync(citizen.Id)).ToList();

        Assert.Single(result);
        Assert.Equal("IdentityDocument", result[0].Type);
    }

    [Fact]
    public async Task GetCredentialsForCitizenAsync_UnknownCitizen_ThrowsCitizenNotFoundException()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        await Assert.ThrowsAsync<CitizenNotFoundException>(
            () => service.GetCredentialsForCitizenAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task ReinstateCredentialAsync_ValidRevokedCredential_UpdatesStatusToActive()
    {
        using var context = CreateContext();
        var (_, credential) = SeedCredential(context, CredentialStatus.Revoked);
        var service = CreateService(context);

        var result = await service.ReinstateCredentialAsync(
            credential.Id,
            Guid.NewGuid(),
            new ReinstateCredentialRequestDto { Reason = "Investigation cleared the citizen" },
            "127.0.0.1"
        );

        Assert.Equal(credential.Id, result.CredentialId);
        Assert.Equal(CredentialStatus.Active, result.Status);
    }

    [Fact]
    public async Task ReinstateCredentialAsync_ValidInvestigationCredential_UpdatesStatusToActive()
    {
        using var context = CreateContext();
        var (_, credential) = SeedCredential(context, CredentialStatus.Investigation);
        var service = CreateService(context);

        var result = await service.ReinstateCredentialAsync(
            credential.Id,
            Guid.NewGuid(),
            new ReinstateCredentialRequestDto { Reason = "Cleared" },
            "127.0.0.1"
        );

        Assert.Equal(CredentialStatus.Active, result.Status);
    }

    [Fact]
    public async Task ReinstateCredentialAsync_CredentialNotFound_ThrowsCredentialNotFoundException()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        await Assert.ThrowsAsync<CredentialNotFoundException>(() =>
            service.ReinstateCredentialAsync(
                Guid.NewGuid(),
                Guid.NewGuid(),
                new ReinstateCredentialRequestDto { Reason = "test" },
                "127.0.0.1"
            ));
    }

    [Fact]
    public async Task ReinstateCredentialAsync_AlreadyActive_ThrowsInvalidCredentialStatusTransitionException()
    {
        using var context = CreateContext();
        var (_, credential) = SeedCredential(context, CredentialStatus.Active);
        var service = CreateService(context);

        await Assert.ThrowsAsync<InvalidCredentialStatusTransitionException>(() =>
            service.ReinstateCredentialAsync(
                credential.Id,
                Guid.NewGuid(),
                new ReinstateCredentialRequestDto { Reason = "test" },
                "127.0.0.1"
            ));
    }
}

