using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICredentialRepository
{
    Task<Credential?> GetByIdAsync(Guid id);
    Task<List<Credential>> GetByUserIdAsync(Guid userId);
}