using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ITrustedDeviceRepository
{
    Task<Citizen?> GetCitizenByUserIdAsync(Guid userId);
    Task<List<TrustedDevice>> GetTrustedDevicesByCitizenIdAsync(Guid citizenId);
    Task<bool> UnlinkDeviceAsync(Guid userId, Guid deviceId);
}