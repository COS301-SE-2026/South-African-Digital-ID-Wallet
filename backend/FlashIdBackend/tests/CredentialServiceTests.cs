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
        Assert.Equal("South African", result[0].IdentityDocument.Nationality);
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
}