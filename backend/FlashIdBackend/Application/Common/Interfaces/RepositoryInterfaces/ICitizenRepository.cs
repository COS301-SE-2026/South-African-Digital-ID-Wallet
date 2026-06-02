using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICitizenRepository
{
    // Loads Citizen together with its related User (navigation property).
    Task<Citizen?> GetCitizenBySaIdWithUserAsync(string saId);

    // Returns true if another user already owns the requested username.
    Task<bool> IsUsernameTakenAsync(string username, Guid excludeUserId);

    Task UpdateCitizenAsync(Citizen citizen);
    Task UpdateUserAsync(User user);
    Task AddAuditLogAsync(AuditLog auditLog);
    Task SaveChangesAsync();
}