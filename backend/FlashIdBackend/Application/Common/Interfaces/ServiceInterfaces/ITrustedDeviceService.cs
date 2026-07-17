using Application.Features.TrustedDevices.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ITrustedDeviceService
{
    Task<IEnumerable<TrustedDeviceDto>> GetMyTrustedDevicesAsync(Guid userId);
}