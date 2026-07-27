using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.TrustedDevices.DTOs;

namespace Application.Common.Services;

public class TrustedDeviceService : ITrustedDeviceService
{
    private readonly ITrustedDeviceRepository _trustedDeviceRepository;
    private readonly TrustedDeviceMapper _mapper;

    public TrustedDeviceService(
        ITrustedDeviceRepository trustedDeviceRepository,
        TrustedDeviceMapper mapper)
    {
        _trustedDeviceRepository = trustedDeviceRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TrustedDeviceDto>> GetMyTrustedDevicesAsync(Guid userId)
    {
        // var citizen = await _trustedDeviceRepository.GetCitizenByUserIdAsync(userId);
        //
        // if (citizen == null)
        // {
        //     return Enumerable.Empty<TrustedDeviceDto>();
        // }

        var devices = await _trustedDeviceRepository
            .GetTrustedDevicesByUserIdAsync(userId);

        return devices.Select(device => _mapper.TrustedDeviceToDto(device));
    }

    public async Task<bool> UnlinkDeviceAsync(Guid userId, Guid deviceId)
    {
        return await _trustedDeviceRepository.UnlinkDeviceAsync(userId, deviceId);
    }
}