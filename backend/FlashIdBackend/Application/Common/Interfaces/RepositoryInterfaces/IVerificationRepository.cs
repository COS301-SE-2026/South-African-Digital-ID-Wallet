using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IVerificationRepository
{
    Task<Citizen?> GetCitizenByUserIdAsync(Guid userId, CancellationToken cancellationToken);

    Task<CitizenActivation?> GetActivationByTokenHashAsync(string tokenHash, CancellationToken cancellationToken);
    Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken);

    Task SaveChangesAsync(CancellationToken cancellationToken);


}