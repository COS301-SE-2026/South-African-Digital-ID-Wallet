using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.TrustedDevices.DTOs;
using Domain.Entities;

namespace Application.Common.Services;

public class TrustedDeviceService : ITrustedDeviceService
{
    private readonly ITrustedDeviceRepository _trustedDeviceRepository;
    private readonly IDeviceTokenProvider _deviceTokenProvider;
    private readonly TrustedDeviceMapper _mapper;

    public TrustedDeviceService(
        ITrustedDeviceRepository trustedDeviceRepository,
        IDeviceTokenProvider deviceTokenProvider,
        TrustedDeviceMapper mapper)
    {
        _trustedDeviceRepository = trustedDeviceRepository;
        _deviceTokenProvider = deviceTokenProvider;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TrustedDeviceDto>> GetMyTrustedDevicesAsync(Guid userId, string currentDeviceToken)
    {
        var devices = await _trustedDeviceRepository
            .GetTrustedDevicesByUserIdAsync(userId);

        string? currentDeviceTokenHash = null;

        if (!string.IsNullOrWhiteSpace(currentDeviceToken))
        {
            currentDeviceTokenHash = _deviceTokenProvider.HashToken(currentDeviceToken);
        }

        return devices.Select(device =>
        {
            var dto = _mapper.TrustedDeviceToDto(device);
            dto.DeviceName = BuildDeviceName(device);
            dto.IsCurrentDevice = currentDeviceTokenHash is not null && string.Equals(device.DeviceTokenHash, currentDeviceTokenHash, StringComparison.Ordinal);
            return dto;
        });
    }

    private static string BuildDeviceName(TrustedDevice trustedDevice)
    {
        var browser = string.IsNullOrEmpty(trustedDevice.Browser) ? "Unknown browser" : trustedDevice.Browser;

        var operatingSystem = string.IsNullOrEmpty(trustedDevice.OperatingSystem) ? trustedDevice.DeviceType.ToString() : trustedDevice.OperatingSystem;

        return $"{browser} on {operatingSystem}";
    }

    public async Task<bool> UnlinkDeviceAsync(Guid userId, Guid deviceId)
    {
        return await _trustedDeviceRepository.UnlinkDeviceAsync(userId, deviceId);
    }
}