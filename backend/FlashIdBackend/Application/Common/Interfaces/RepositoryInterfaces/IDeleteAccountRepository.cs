using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IDeleteAccountRepository
{
    Task<Citizen?> GetCitizenByUserIdAsync(Guid userId);
    Task DeleteCredentialsAsync(Guid citizenId);
    Task DeleteTrustedDevicesAsync(Guid citizenId);
    Task DeleteNotificationsAsync(Guid citizenId);
    Task DeleteAuditLogsAsync(Guid userId);
    Task DeleteCitizenAsync(Citizen citizen);
    Task DeleteUserAsync(Guid userId);
    Task SaveChangesAsync();
    Task DeleteQrDisclosureTokensAsync(Guid citizenId);
}