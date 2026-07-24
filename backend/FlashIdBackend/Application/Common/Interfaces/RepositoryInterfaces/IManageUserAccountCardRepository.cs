using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IManageUserAccountRepository
{
    Task<Citizen?> GetByUserIdAsync(Guid userId);
    Task UpdateAsync(Citizen citizen);
}