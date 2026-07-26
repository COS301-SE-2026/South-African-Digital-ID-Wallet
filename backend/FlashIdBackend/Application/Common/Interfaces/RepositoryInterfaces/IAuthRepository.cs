using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IAuthRepository
{
    Task<(string? Names, string? Surname)> GetCitizenNameByUserIdAsync(Guid userId);
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByIdAsync(Guid userId);
    Task UpdateUserAsync(User user);
    Task AddAuditLogAsync(AuditLog auditLog);
    Task SaveChangesAsync();
}