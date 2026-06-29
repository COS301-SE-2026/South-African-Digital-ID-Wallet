using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICitizenRepository
{
    Task<bool> IsEmailTakenAsync(string email, Guid excludeUserId);
    Task<User?> GetUserByEmailAsync(string email);
    Task AddUserAync(User user);
    Task UpdateUserAsync(User user);
    Task AddAuditLogAsync(AuditLog auditLog);
    Task SaveChangesAsync();
}