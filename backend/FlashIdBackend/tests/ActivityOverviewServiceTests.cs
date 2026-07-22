using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class ActivityOverviewServiceTests
{
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
            PasswordHash = "hash",
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
            IpAddress = "192.168.1.10",
            CreatedAt = DateTime.UtcNow
        };

        context.DomainUsers.Add(user);
        context.Citizens.Add(citizen);
        context.AuditLogs.Add(auditLog);

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

        context.DomainUsers.AddRange(
            new User
            {
                Id = userId,
                Email = "user1@test.com",
                PhoneNumber = "0821111111",
                PasswordHash = "hash",
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
                PasswordHash = "hash",
                PasswordSet = true,
                Role = UserRole.Citizen,
                IsDeleted = false,
                IsEmailVerified = true
            });

        context.AuditLogs.AddRange(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                ActorId = userId,
                EventType = AuditEventType.UserLoggedIn,
                Details = "Correct User",
                IpAddress = "192.168.1.10",
                CreatedAt = DateTime.UtcNow
            },
            new AuditLog
            {
                Id = Guid.NewGuid(),
                ActorId = otherUserId,
                EventType = AuditEventType.UserLoggedOut,
                Details = "Other User",
                IpAddress = "192.168.1.11",
                CreatedAt = DateTime.UtcNow
            });

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

        context.DomainUsers.Add(new User
        {
            Id = userId,
            Email = "logan@test.com",
            PhoneNumber = "0821234567",
            PasswordHash = "hash",
            PasswordSet = true,
            Role = UserRole.Citizen,
            IsDeleted = false,
            IsEmailVerified = true
        });

        var older = DateTime.UtcNow.AddMinutes(-10);
        var newer = DateTime.UtcNow;

        context.AuditLogs.AddRange(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                ActorId = userId,
                EventType = AuditEventType.UserLoggedIn,
                Details = "Older Activity",
                IpAddress = "192.168.1.10",
                CreatedAt = older
            },
            new AuditLog
            {
                Id = Guid.NewGuid(),
                ActorId = userId,
                EventType = AuditEventType.UserLoggedOut,
                Details = "Newest Activity",
                IpAddress = "192.168.1.10",
                CreatedAt = newer
            });

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = (await service.GetMyActivityAsync(userId)).ToList();

        Assert.Equal(2, result.Count);
        Assert.Equal("Newest Activity", result[0].Title);
        Assert.Equal("Older Activity", result[1].Title);
        Assert.True(result[0].Timestamp > result[1].Timestamp);
    }
}