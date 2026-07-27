using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ITrustedDeviceRepository
{
    //Task<Citizen?> GetCitizenByUserIdAsync(Guid userId);
    Task<List<TrustedDevice>> GetTrustedDevicesByUserIdAsync(Guid usrId);
    Task<bool> UnlinkDeviceAsync(Guid userId, Guid deviceId);
    Task<TrustedDevice?> GetByTokenHashAsync(Guid userId, string deviceToken, CancellationToken cancellationToken);
    Task AddTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken);
    Task UpdateTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken);
}