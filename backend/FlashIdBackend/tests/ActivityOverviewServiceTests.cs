using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class ActivityOverviewServiceTests
{
    private const string TestIpAddressPrimary = "192.168.1.10"; // NOSONAR
    private const string TestIpAddressSecondary = "192.168.1.11"; // NOSONAR

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static ActivityOverviewService CreateService(AppDbContext context)
    {
        return new ActivityOverviewService(
            new ActivityOverviewRepository(context)
        );
    }

    [Fact]
    public async Task GetMyActivityAsync_NoActivity_ReturnsEmpty()
    {
        using var context = CreateContext();

        var service = CreateService(context);

        var result = await service.GetMyActivityAsync(Guid.NewGuid());

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetMyActivityAsync_ReturnsMappedActivity()
    {
        using var context = CreateContext();

        var userId = Guid.NewGuid();

        var user = new User
        {
            Id = userId,
            Email = "logan@test.com",
            PhoneNumber = "0821234567",
            PasswordHash = "hash", // NOSONAR
            PasswordSet = true,
            Role = UserRole.Citizen,
            IsDeleted = false,
            IsEmailVerified = true
        };

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Names = "Logan",
            Surname = "Dlamini"
        };

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = userId,
            EventType = AuditEventType.UserLoggedIn,
            Details = "User logged in successfully",
            IpAddress = TestIpAddressPrimary,
            CreatedAt = DateTime.UtcNow
        };

        await context.DomainUsers.AddAsync(user, TestContext.Current.CancellationToken);
        await context.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.AuditLogs.AddAsync(auditLog, TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = (await service.GetMyActivityAsync(userId)).ToList();

        Assert.Single(result);
        Assert.Equal(auditLog.Id, result[0].Id);
        Assert.Equal("User logged in successfully", result[0].Title);
        Assert.Equal(auditLog.CreatedAt, result[0].Timestamp);
        Assert.Equal(AuditEventType.UserLoggedIn.ToString(), result[0].Type);
    }

    [Fact]
    public async Task GetMyActivityAsync_OnlyReturnsActivityForSpecifiedUser()
    {
        using var context = CreateContext();

        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        await context.DomainUsers.AddRangeAsync(
            new[]
            {
                new User
                {
                    Id = userId,
                    Email = "user1@test.com",
                    PhoneNumber = "0821111111",
                    PasswordHash = "hash", // NOSONAR
                    PasswordSet = true,
                    Role = UserRole.Citizen,
                    IsDeleted = false,
                    IsEmailVerified = true
                },
                new User
                {
                    Id = otherUserId,
                    Email = "user2@test.com",
                    PhoneNumber = "0822222222",
                    PasswordHash = "hash", // NOSONAR
                    PasswordSet = true,
                    Role = UserRole.Citizen,
                    IsDeleted = false,
                    IsEmailVerified = true
                }
            },
            TestContext.Current.CancellationToken);

        await context.AuditLogs.AddRangeAsync(
            new[]
            {
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    ActorId = userId,
                    EventType = AuditEventType.UserLoggedIn,
                    Details = "Correct User",
                    IpAddress = TestIpAddressPrimary,
                    CreatedAt = DateTime.UtcNow
                },
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    ActorId = otherUserId,
                    EventType = AuditEventType.UserLoggedOut,
                    Details = "Other User",
                    IpAddress = TestIpAddressSecondary,
                    CreatedAt = DateTime.UtcNow
                }
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = (await service.GetMyActivityAsync(userId)).ToList();

        Assert.Single(result);
        Assert.Equal("Correct User", result[0].Title);
    }

    [Fact]
    public async Task GetMyActivityAsync_ReturnsActivityInDescendingOrder()
    {
        using var context = CreateContext();

        var userId = Guid.NewGuid();

        await context.DomainUsers.AddAsync(
            new User
            {
                Id = userId,
                Email = "logan@test.com",
                PhoneNumber = "0821234567",
                PasswordHash = "hash", // NOSONAR
                PasswordSet = true,
                Role = UserRole.Citizen,
                IsDeleted = false,
                IsEmailVerified = true
            },
            TestContext.Current.CancellationToken);

        var older = DateTime.UtcNow.AddMinutes(-10);
        var newer = DateTime.UtcNow;

        await context.AuditLogs.AddRangeAsync(
            new[]
            {
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    ActorId = userId,
                    EventType = AuditEventType.UserLoggedIn,
                    Details = "Older Activity",
                    IpAddress = TestIpAddressPrimary,
                    CreatedAt = older
                },
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    ActorId = userId,
                    EventType = AuditEventType.UserLoggedOut,
                    Details = "Newest Activity",
                    IpAddress = TestIpAddressPrimary,
                    CreatedAt = newer
                }
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = (await service.GetMyActivityAsync(userId)).ToList();

        Assert.Equal(2, result.Count);
        Assert.Equal("Newest Activity", result[0].Title);
        Assert.Equal("Older Activity", result[1].Title);
        Assert.True(result[0].Timestamp > result[1].Timestamp);
    }
}