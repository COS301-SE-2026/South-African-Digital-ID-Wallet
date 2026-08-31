using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IPhysicalIdentityVerificationRepository
{
    Task<PhysicalIdentityVerification> GetByIdAsync(Guid verificationId, CancellationToken cancellationToken);

    Task<PhysicalIdentityVerification?> GetActiveForUserAsync(Guid userId, CancellationToken cancellationToken);

    Task AddAsync(PhysicalIdentityVerification verification, CancellationToken cancellationToken);

    Task SaveChangesAsync(CancellationToken cancellationToken);

}