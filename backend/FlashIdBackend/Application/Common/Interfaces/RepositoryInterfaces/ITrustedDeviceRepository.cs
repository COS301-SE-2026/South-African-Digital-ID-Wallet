using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ITrustedDeviceRepository
{
    //Task<Citizen?> GetCitizenByUserIdAsync(Guid userId);
    Task<List<TrustedDevice>> GetTrustedDevicesByUserIdAsync(Guid userId);
    Task<bool> UnlinkDeviceAsync(Guid userId, Guid deviceId);
    Task<TrustedDevice?> GetByTokenHashAsync(Guid userId, string deviceTokenHash, CancellationToken cancellationToken);
    Task AddTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken);
    Task UpdateTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken);
    Task AddDeviceVerificationAsync(DeviceVerification deviceVerification, CancellationToken cancellationToken);
    Task UpdateDeviceVerificationAsync(DeviceVerification deviceVerification, CancellationToken cancellationToken);
    Task<DeviceVerification?> GetDeviceVerificationAsync(Guid deviceVerificationId, CancellationToken cancellationToken);
}