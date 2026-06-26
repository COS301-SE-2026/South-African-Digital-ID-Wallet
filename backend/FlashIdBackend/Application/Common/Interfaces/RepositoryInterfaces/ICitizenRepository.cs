using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICitizenRepository
{

    // Task<Citizen?> GetCitizenBySaIdWithUserAsync(string saId);


    // Task<bool> IsUsernameTakenAsync(string username, Guid excludeUserId);

    Task<bool> IsEmailTakenAsync(string email, Guid excludeUserId);

    // Task UpdateCitizenAsync(Citizen citizen);
    Task AddUserAync(User user);
    // Task UpdateUserAsync(User user);
    Task AddAuditLogAsync(AuditLog auditLog);
    Task SaveChangesAsync();
}