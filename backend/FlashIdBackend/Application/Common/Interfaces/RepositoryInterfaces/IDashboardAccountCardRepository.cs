using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IDashboardAccountCardRepository
{
    Task<Citizen?> GetCitizenByUserIdAsync(Guid userId);
}