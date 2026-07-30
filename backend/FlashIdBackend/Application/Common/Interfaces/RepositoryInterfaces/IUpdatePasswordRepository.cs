using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IUpdatePasswordRepository
{
    Task<User?> GetUserByIdAsync(Guid userId);

    Task UpdateUserAsync(User user);

    Task SaveChangesAsync();
}