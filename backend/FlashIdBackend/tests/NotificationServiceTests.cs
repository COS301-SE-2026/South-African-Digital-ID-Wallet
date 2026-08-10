using Application.Common.Services;
using Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class NotificationServiceTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static NotificationService CreateService(AppDbContext context)
    {
        return new NotificationService(
            new NotificationRepository(context)
        );
    }

    [Fact]
    public async Task GetMyNotificationsAsync_NoCitizen_ReturnsEmpty()
    {
        using var context = CreateContext();

        var service = CreateService(context);

        var result = await service.GetMyNotificationsAsync(Guid.NewGuid());

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetMyNotificationsAsync_ReturnsMappedNotifications()
    {
        using var context = CreateContext();

        var userId = Guid.NewGuid();

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SaId = "0001015009087",
            Names = "Logan",
            Surname = "Dlamini"
        };

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Title = "Credential Issued",
            Description = "Your Digital ID has been issued.",
            Tone = "Success",
            CreatedAt = DateTime.UtcNow
        };

        await context.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);
        await context.Notifications.AddAsync(notification, TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = (await service.GetMyNotificationsAsync(userId)).ToList();

        Assert.Single(result);

        Assert.Equal(notification.Id, result[0].Id);
        Assert.Equal("Credential Issued", result[0].Title);
        Assert.Equal("Your Digital ID has been issued.", result[0].Description);
        Assert.Equal("Success", result[0].Tone);
    }

    [Fact]
    public async Task GetMyNotificationsAsync_OnlyReturnsNotificationsForSpecifiedCitizen()
    {
        using var context = CreateContext();

        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SaId = "0001015009087",
            Names = "Logan",
            Surname = "Dlamini"
        };

        var otherCitizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = otherUserId,
            SaId = "0101015009088",
            Names = "Jane",
            Surname = "Smith"
        };

        await context.Citizens.AddRangeAsync(
            new[] { citizen, otherCitizen },
            TestContext.Current.CancellationToken);

        await context.Notifications.AddRangeAsync(
            new[]
            {
                new Notification
                {
                    Id = Guid.NewGuid(),
                    CitizenId = citizen.Id,
                    Title = "My Notification",
                    Description = "Visible",
                    Tone = "Info",
                    CreatedAt = DateTime.UtcNow
                },
                new Notification
                {
                    Id = Guid.NewGuid(),
                    CitizenId = otherCitizen.Id,
                    Title = "Other Notification",
                    Description = "Hidden",
                    Tone = "Warning",
                    CreatedAt = DateTime.UtcNow
                }
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = (await service.GetMyNotificationsAsync(userId)).ToList();

        Assert.Single(result);
        Assert.Equal("My Notification", result[0].Title);
    }

    [Fact]
    public async Task GetMyNotificationsAsync_ReturnsNotificationsInDescendingOrder()
    {
        using var context = CreateContext();

        var userId = Guid.NewGuid();

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SaId = "0001015009087",
            Names = "Logan",
            Surname = "Dlamini"
        };

        await context.Citizens.AddAsync(citizen, TestContext.Current.CancellationToken);

        var older = DateTime.UtcNow.AddMinutes(-10);
        var newer = DateTime.UtcNow;

        await context.Notifications.AddRangeAsync(
            new[]
            {
                new Notification
                {
                    Id = Guid.NewGuid(),
                    CitizenId = citizen.Id,
                    Title = "Older Notification",
                    Description = "Old",
                    Tone = "Info",
                    CreatedAt = older
                },
                new Notification
                {
                    Id = Guid.NewGuid(),
                    CitizenId = citizen.Id,
                    Title = "Newest Notification",
                    Description = "New",
                    Tone = "Success",
                    CreatedAt = newer
                }
            },
            TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = (await service.GetMyNotificationsAsync(userId)).ToList();

        Assert.Equal(2, result.Count);
        Assert.Equal("Newest Notification", result[0].Title);
        Assert.Equal("Older Notification", result[1].Title);
    }
}