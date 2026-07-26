using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ITrustedDeviceRepository
{
    Task<Citizen?> GetCitizenByUserIdAsync(Guid userId);
    Task<List<TrustedDevice>> GetTrustedDevicesByCitizenIdAsync(Guid citizenId);
    Task<bool> UnlinkDeviceAsync(Guid userId, Guid deviceId);
    Task<TrustedDevice?> GetTokenHashAsync(Guid citizenId, string deviceToken, CancellationToken cancellationToken);
    Task AddTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken);
    Task UpdateTrustedDeviceAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken);
}