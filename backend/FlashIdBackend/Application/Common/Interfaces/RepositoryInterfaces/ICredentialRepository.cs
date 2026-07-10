using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICredentialRepository
{
    Task<Credential?> GetByIdAsync(Guid id);
}