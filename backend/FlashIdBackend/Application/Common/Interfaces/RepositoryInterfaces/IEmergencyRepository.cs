using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IEmergencyRepository
{
    Task<EmergencyDevice?> GetActiveDeviceByHandleAsync(byte[] handle, CancellationToken ct);
    Task<EmergencyDevice?> GetActiveDeviceByCitizenIdAsync(Guid citizenId, CancellationToken ct);
    Task<EmergencyProfile?> GetEnabledProfileWithContactsAsync(Guid citizenId, CancellationToken ct);
    Task<EmergencyProfile?> GetProfileByUserIdAsync(Guid userId, CancellationToken ct);
    Task<EmergencyAccess?> GetAccessWithContactsAsync(Guid accessId, CancellationToken ct);
    Task<List<EmergencyAccess>> GetAccessHistoryByUserIdAsync(Guid userId, CancellationToken ct);

    Task<Official?> GetResponderAsync(Guid responderUserId, CancellationToken ct);

    Task<bool> TryClaimCodeAsync(byte[] handle, DateTimeOffset issuedAt, CancellationToken ct);

    Task AddDeviceAsync(EmergencyDevice device, CancellationToken ct);
    Task AddAccessAsync(EmergencyAccess access, CancellationToken ct);
    Task AddProfileAsync(EmergencyProfile profile, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}