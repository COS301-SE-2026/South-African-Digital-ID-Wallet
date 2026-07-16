using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICredentialRepository
{
    Task<Citizen?> GetCitizenByUserIdAsync(Guid userId);
    Task<List<Credential>> GetCredentialsByCitizenIdAsync(Guid citizenId);
}