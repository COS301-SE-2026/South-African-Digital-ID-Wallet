using Application.Features.GovAdminAuditLog.Exceptions;
using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class GovAdminAuditLogServiceTests
{
    private const string TestIpAddress = "192.168.1.10"; // NOSONAR

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static GovAdminAuditLogService CreateService(AppDbContext context)
    {
        return new GovAdminAuditLogService(new GovAdminAuditLogRepository(context));
    }

    private static User CreateUser(Guid id, string email, UserRole role)
    {
        return new User
        {
            Id = id,
            Email = email,
            PhoneNumber = "0821234567",
            PasswordHash = "hash", // NOSONAR
            PasswordSet = true,
            Role = role,
            IsDeleted = false,
            IsEmailVerified = true
        };
    }

    private static Citizen CreateCitizen(Guid id)
    {
        return new Citizen
        {
            Id = id,
            SaId = "9001015800081",
            Names = "Logan",
            Surname = "Dlamini",
            DateOfBirth = new DateTime(1990, 1, 1),
            Status = CitizenStatus.Activated
        };
    }

    private static Credential CreateCredential(Guid id, Guid citizenId)
    {
        return new Credential
        {
            Id = id,
            CitizenId = citizenId,
            Status = CredentialStatus.Active,
            Signature = "sig", // NOSONAR
            IssuedBy = "system",
            IssueDate = DateTime.UtcNow
        };
    }

    [Fact]
    public async Task GetAuditLogsAsync_NoLogs_ReturnsEmptyWithZeroTotal()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.GetAuditLogsAsync(null, null, null, null, null, null);

        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalCount);
        Assert.Equal(1, result.Page);
    }

    [Fact]
    public async Task GetAuditLogsAsync_MapsActorEmailAndRole()
    {
        using var context = CreateContext();
        var userId = Guid.NewGuid();

        await context.DomainUsers.AddAsync(
            CreateUser(userId, "admin@test.com", UserRole.GovernmentAdministrator),
            TestContext.Current.CancellationToken);

        await context.AuditLogs.AddAsync(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                ActorId = userId,
                EventType = AuditEventType.UserLoggedIn,
                Details = "Successful login via web",
                IpAddress = TestIpAddress,
                CreatedAt = DateTime.UtcNow
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = await service.GetAuditLogsAsync(null, null, null, null, null, null);

        Assert.Single(result.Items);
        Assert.Equal("admin@test.com", result.Items[0].UserName);
        Assert.Equal(UserRole.GovernmentAdministrator.ToString(), result.Items[0].Role);
        Assert.Equal("Successful login via web", result.Items[0].Description);
    }

    [Fact]
    public async Task GetAuditLogsAsync_FailedEventType_MapsOutcomeAsFailure()
    {
        using var context = CreateContext();

        await context.AuditLogs.AddAsync(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                EventType = AuditEventType.DeviceVerificationFailed,
                Details = "Device verification failed",
                IpAddress = TestIpAddress,
                CreatedAt = DateTime.UtcNow
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = await service.GetAuditLogsAsync(null, null, null, null, null, null);

        Assert.Equal("Failed", result.Items[0].Outcome);
    }

    [Fact]
    public async Task GetAuditLogsAsync_SuccessEventType_MapsOutcomeAsSuccess()
    {
        using var context = CreateContext();

        await context.AuditLogs.AddAsync(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                EventType = AuditEventType.UserLoggedIn,
                Details = "Successful login",
                IpAddress = TestIpAddress,
                CreatedAt = DateTime.UtcNow
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = await service.GetAuditLogsAsync(null, null, null, null, null, null);

        Assert.Equal("Success", result.Items[0].Outcome);
    }

    [Fact]
    public async Task GetAuditLogsAsync_CredentialWithDriversLicense_SetsEntityTypeDriversLicence()
    {
        using var context = CreateContext();
        var citizenId = Guid.NewGuid();
        var credentialId = Guid.NewGuid();

        await context.Citizens.AddAsync(CreateCitizen(citizenId), TestContext.Current.CancellationToken);
        await context.Credentials.AddAsync(CreateCredential(credentialId, citizenId), TestContext.Current.CancellationToken);
        await context.DriversLicenses.AddAsync(
            new DriversLicense
            {
                Id = Guid.NewGuid(),
                CredentialId = credentialId,
                LicenseNumber = "DL123456", // NOSONAR
                ExpiryDate = DateTime.UtcNow.AddYears(5),
                PhotoPath = "path/to/photo.jpg",
            },
            TestContext.Current.CancellationToken);

        await context.AuditLogs.AddAsync(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                CredentialId = credentialId,
                EventType = AuditEventType.CredentialIssued,
                Details = "Drivers license issued",
                IpAddress = TestIpAddress,
                CreatedAt = DateTime.UtcNow
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = await service.GetAuditLogsAsync(null, null, null, null, null, null);

        Assert.Equal("Driver's Licence", result.Items[0].EntityType);
    }

    [Fact]
    public async Task GetAuditLogsAsync_CitizenLinkedLog_SetsEntityTypeCitizen()
    {
        using var context = CreateContext();
        var citizenId = Guid.NewGuid();

        await context.Citizens.AddAsync(CreateCitizen(citizenId), TestContext.Current.CancellationToken);
        await context.AuditLogs.AddAsync(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                CitizenId = citizenId,
                EventType = AuditEventType.CitizenVerified,
                Details = "Citizen verified",
                IpAddress = TestIpAddress,
                CreatedAt = DateTime.UtcNow
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = await service.GetAuditLogsAsync(null, null, null, null, null, null);

        Assert.Equal("Citizen", result.Items[0].EntityType);
    }

    [Fact]
    public async Task GetAuditLogsAsync_NoCredentialOrCitizen_EntityTypeIsNull()
    {
        using var context = CreateContext();

        await context.AuditLogs.AddAsync(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                EventType = AuditEventType.UserLoggedOut,
                Details = "User logged out",
                IpAddress = TestIpAddress,
                CreatedAt = DateTime.UtcNow
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = await service.GetAuditLogsAsync(null, null, null, null, null, null);

        Assert.Null(result.Items[0].EntityType);
    }

    [Fact]
    public async Task GetAuditLogsAsync_FiltersByAction()
    {
        using var context = CreateContext();

        await context.AuditLogs.AddRangeAsync(
            new[]
            {
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = AuditEventType.UserLoggedIn,
                    Details = "Login event",
                    IpAddress = TestIpAddress,
                    CreatedAt = DateTime.UtcNow
                },
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = AuditEventType.UserLoggedOut,
                    Details = "Logout event",
                    IpAddress = TestIpAddress,
                    CreatedAt = DateTime.UtcNow
                }
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = await service.GetAuditLogsAsync(null, "UserLoggedIn", null, null, null, null);

        Assert.Single(result.Items);
        Assert.Equal("UserLoggedIn", result.Items[0].Action);
    }

    [Fact]
    public async Task GetAuditLogsAsync_InvalidAction_ThrowsInvalidAuditActionException()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        await Assert.ThrowsAsync<InvalidAuditActionException>(() =>
            service.GetAuditLogsAsync(null, "NotARealAction", null, null, null, null));
    }

    [Fact]
    public async Task GetAuditLogsAsync_FiltersBySearchTerm_MatchesDetails()
    {
        using var context = CreateContext();

        await context.AuditLogs.AddRangeAsync(
            new[]
            {
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = AuditEventType.CredentialRevoked,
                    Details = "Credential revoked due to fraud",
                    IpAddress = TestIpAddress,
                    CreatedAt = DateTime.UtcNow
                },
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = AuditEventType.UserLoggedIn,
                    Details = "Successful login",
                    IpAddress = TestIpAddress,
                    CreatedAt = DateTime.UtcNow
                }
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = await service.GetAuditLogsAsync("fraud", null, null, null, null, null);

        Assert.Single(result.Items);
        Assert.Contains("fraud", result.Items[0].Description);
    }

    [Fact]
    public async Task GetAuditLogsAsync_FiltersByDateRange()
    {
        using var context = CreateContext();

        var outOfRange = DateTime.UtcNow.AddDays(-30);
        var inRange = DateTime.UtcNow.AddDays(-1);

        await context.AuditLogs.AddRangeAsync(
            new[]
            {
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = AuditEventType.UserLoggedIn,
                    Details = "Old event",
                    IpAddress = TestIpAddress,
                    CreatedAt = outOfRange
                },
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = AuditEventType.UserLoggedIn,
                    Details = "Recent event",
                    IpAddress = TestIpAddress,
                    CreatedAt = inRange
                }
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = await service.GetAuditLogsAsync(
            null, null, DateTime.UtcNow.AddDays(-7), DateTime.UtcNow, null, null);

        Assert.Single(result.Items);
        Assert.Equal("Recent event", result.Items[0].Description);
    }

    [Fact]
    public async Task GetAuditLogsAsync_ReturnsResultsInDescendingOrderByCreatedAt()
    {
        using var context = CreateContext();

        var older = DateTime.UtcNow.AddMinutes(-10);
        var newer = DateTime.UtcNow;

        await context.AuditLogs.AddRangeAsync(
            new[]
            {
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = AuditEventType.UserLoggedIn,
                    Details = "Older",
                    IpAddress = TestIpAddress,
                    CreatedAt = older
                },
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = AuditEventType.UserLoggedOut,
                    Details = "Newer",
                    IpAddress = TestIpAddress,
                    CreatedAt = newer
                }
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = await service.GetAuditLogsAsync(null, null, null, null, null, null);

        Assert.Equal(2, result.Items.Count);
        Assert.Equal("Newer", result.Items[0].Description);
        Assert.Equal("Older", result.Items[1].Description);
    }

    [Fact]
    public async Task GetAuditLogsAsync_ClampsPageAndPageSize()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.GetAuditLogsAsync(null, null, null, null, 0, 500);

        Assert.Equal(1, result.Page);
        Assert.Equal(100, result.PageSize);
    }

    [Fact]
    public async Task GetAuditLogsAsync_Pagination_ReturnsCorrectPageAndTotalCount()
    {
        using var context = CreateContext();

        for (var i = 0; i < 15; i++)
        {
            await context.AuditLogs.AddAsync(
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = AuditEventType.UserLoggedIn,
                    Details = $"Event {i}",
                    IpAddress = TestIpAddress,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-i)
                },
                TestContext.Current.CancellationToken);
        }

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);
        var result = await service.GetAuditLogsAsync(null, null, null, null, 2, 10);

        Assert.Equal(5, result.Items.Count);
        Assert.Equal(15, result.TotalCount);
        Assert.Equal(2, result.Page);
        Assert.Equal(10, result.PageSize);
    }
}
