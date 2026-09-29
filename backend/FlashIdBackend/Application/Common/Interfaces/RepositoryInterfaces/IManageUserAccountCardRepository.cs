using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IManageUserAccountRepository
{
    Task<Citizen?> GetByUserIdAsync(Guid userId);
    Task UpdateAsync(Citizen citizen);
    Task<User?> GetUserByIdAsync(Guid userId);
    Task UpdateUserAsync(User user);
    Task<bool> IsEmailTakenAsync(string email, Guid excludeUserId);
    Task AddAuditLogAsync(AuditLog auditLog);
    Task SaveChangesAsync();
    Task<bool> TryConfirmEmailChangeAsync(User user, AuditLog auditLog);
}