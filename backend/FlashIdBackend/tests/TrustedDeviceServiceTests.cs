using Application.Common.Mapping;
using Application.Common.Services;
using Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class TrustedDeviceServiceTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static TrustedDeviceService CreateService(AppDbContext context)
    {
        return new TrustedDeviceService(
            new TrustedDeviceRepository(context),
            new TrustedDeviceMapper()
        );
    }

    [Fact]
    public async Task GetMyTrustedDevicesAsync_NoCitizen_ReturnsEmpty()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.GetMyTrustedDevicesAsync(Guid.NewGuid());

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetMyTrustedDevicesAsync_ReturnsMappedDevices()
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

        var device = new TrustedDevice
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            DeviceName = "MacBook Air",
            DeviceType = "Laptop",
            OperatingSystem = "macOS",
            Browser = "Chrome",
            IpAddress = "192.168.1.10",
            Location = "Pretoria",
            LastActive = DateTime.UtcNow,
            IsCurrentDevice = true,
            IsTrusted = true
        };

        context.Citizens.Add(citizen);
        context.TrustedDevices.Add(device);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = (await service.GetMyTrustedDevicesAsync(userId)).ToList();

        Assert.Single(result);

        Assert.Equal(device.Id, result[0].Id);
        Assert.Equal("MacBook Air", result[0].DeviceName);
        Assert.Equal("Laptop", result[0].DeviceType);
        Assert.Equal("macOS", result[0].OperatingSystem);
        Assert.Equal("Chrome", result[0].Browser);
        Assert.Equal("192.168.1.10", result[0].IpAddress);
        Assert.Equal("Pretoria", result[0].Location);
        Assert.True(result[0].IsCurrentDevice);
        Assert.True(result[0].IsTrusted);
    }

    [Fact]
    public async Task UnlinkDeviceAsync_DeviceExists_ReturnsTrue_AndRemovesDevice()
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

        var device = new TrustedDevice
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            DeviceName = "MacBook Air",
            DeviceType = "Laptop",
            OperatingSystem = "macOS",
            Browser = "Chrome",
            IpAddress = "192.168.1.10",
            Location = "Pretoria",
            LastActive = DateTime.UtcNow,
            IsCurrentDevice = true,
            IsTrusted = true
        };

        context.Citizens.Add(citizen);
        context.TrustedDevices.Add(device);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = await service.UnlinkDeviceAsync(userId, device.Id);

        Assert.True(result);

        Assert.Empty(context.TrustedDevices);
    }

    [Fact]
    public async Task UnlinkDeviceAsync_DeviceDoesNotExist_ReturnsFalse()
    {
        using var context = CreateContext();

        var service = CreateService(context);

        var result = await service.UnlinkDeviceAsync(Guid.NewGuid(), Guid.NewGuid());

        Assert.False(result);
    }
}