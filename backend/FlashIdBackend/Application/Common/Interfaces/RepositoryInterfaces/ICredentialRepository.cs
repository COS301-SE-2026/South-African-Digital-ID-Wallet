using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICredentialRepository
{
    Task<Citizen?> GetCitizenByUserIdAsync(Guid userId);
    Task<List<Credential>> GetCredentialsByCitizenIdAsync(Guid citizenId);
    Task<Credential?> GetByIdAsync(Guid id);
    Task<List<Credential>> GetByUserIdAsync(Guid userId);
    Task<Citizen?> GetCitizenByIdAsync(Guid userId, CancellationToken cancellationToken);
    Task SaveChangesAsync();
    Task<(List<Citizen> Citizens, int TotalCount)> SearchCitizensAsync(string? query, int page, int pageSize);

}