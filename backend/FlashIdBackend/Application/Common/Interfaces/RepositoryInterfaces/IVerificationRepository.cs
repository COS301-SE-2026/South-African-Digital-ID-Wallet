using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IVerificationRepository
{
    Task<Citizen?> GetCitizenByUserIdAsync(Guid userId, CancellationToken cancellationToken);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}