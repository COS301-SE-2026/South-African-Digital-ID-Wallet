using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class TrustedDeviceServiceTests
{
    private const string TestIpAddress = "192.168.1.10";
    private const string RawDeviceToken = "test-browser-token";// NOSONAR - test-only dummy credential, not a real secret
    private const string HashedDeviceToken = "hashed-test-browser-token";// NOSONAR - test-only dummy credential, not a real secret

    private class FakeDeviceTokenProvider : IDeviceTokenProvider
    {
        public string GenerateToken()
        {
            return RawDeviceToken;
        }

        public string HashToken(string rawToken)
        {
            return rawToken == RawDeviceToken ? HashedDeviceToken : $"hashed-{rawToken}";
        }
    }
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
            new FakeDeviceTokenProvider(),
            new TrustedDeviceMapper()
        );
    }

    private static TrustedDevice CreateTrustedDevice(Guid userId, string deviceTokenHash = HashedDeviceToken)
    {
        return new TrustedDevice
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DeviceTokenHash = deviceTokenHash,
            DeviceType = Enum.Parse<DeviceType>("Laptop"),
            OperatingSystem = "Windows 11",
            Browser = "Chrome",
            LastKnownCity = "Pretoria",
            LastKnownCountry = "South Africa",
            LastActive = DateTime.UtcNow.AddDays(-1),
            IsTrusted = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    [Fact]
    public async Task GetMyTrustedDevicesAsync_NoDevices_ReturnsEmpty()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.GetMyTrustedDevicesAsync(Guid.NewGuid(), RawDeviceToken);

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetMyTrustedDevicesAsync_ReturnsMappedDevices()
    {
        using var context = CreateContext();

        var userId = Guid.NewGuid();
        var device = CreateTrustedDevice(userId);
        await context.TrustedDevices.AddAsync(device, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = (await service.GetMyTrustedDevicesAsync(userId, RawDeviceToken)).ToList();

        Assert.Single(result);

        Assert.Equal(device.Id, result[0].Id);
        Assert.Equal("Chrome on Windows 11", result[0].DeviceName);
        Assert.Equal(device.DeviceType.ToString(), result[0].DeviceType);
        Assert.Equal("Windows 11", result[0].OperatingSystem);
        Assert.Equal("Chrome", result[0].Browser);
        Assert.Equal("Pretoria", result[0].LastKnownCity);
        Assert.Equal("South Africa", result[0].LastKnownCountry);
        Assert.True(result[0].IsCurrentDevice);
        Assert.True(result[0].IsTrusted);
    }

    [Fact]
    public async Task GetMyTrustedDevicesAsync_DifferentToken_IsNotCurrentDevice()
    {
        await using var context = CreateContext();
        var userId = Guid.NewGuid();
        var device = CreateTrustedDevice(userId, "some-other-token-hash");
        await context.TrustedDevices.AddAsync(device, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        var service = CreateService(context);
        var result = (await service.GetMyTrustedDevicesAsync(userId, RawDeviceToken)).Single();
        Assert.False(result.IsCurrentDevice);
    }

    [Fact]
    public async Task UnlinkDeviceAsync_DeviceExists_ReturnsTrue_AndRemovesDevice()
    {
        await using var context = CreateContext();

        var userId = Guid.NewGuid();

        var device = CreateTrustedDevice(userId, "some-other-token-hash");

        await context.TrustedDevices.AddAsync(device, TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = await service.UnlinkDeviceAsync(userId, device.Id);

        Assert.True(result);

        Assert.False(await context.TrustedDevices.AnyAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task UnlinkDeviceAsync_DeviceBelongsToDifferentUser_ReturnsFalse()
    {
        await using var context = CreateContext();

        var deviceOwnerId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();

        var device = CreateTrustedDevice(deviceOwnerId);

        await context.TrustedDevices.AddAsync(device, TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var service = CreateService(context);

        var result = await service.UnlinkDeviceAsync(differentUserId, device.Id);

        Assert.False(result);

        Assert.True(await context.TrustedDevices.AnyAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task UnlinkDeviceAsync_DeviceDoesNotExist_ReturnsFalse()
    {
        await using var context = CreateContext();

        var service = CreateService(context);

        var result = await service.UnlinkDeviceAsync(Guid.NewGuid(), Guid.NewGuid());

        Assert.False(result);
    }
}