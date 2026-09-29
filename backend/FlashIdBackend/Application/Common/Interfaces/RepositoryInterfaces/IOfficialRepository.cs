using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IOfficialRepository
{
    Task<Official?> GetByUserIdAsync(Guid userId);
    Task<Official?> GetByIdAsync(Guid id);
}