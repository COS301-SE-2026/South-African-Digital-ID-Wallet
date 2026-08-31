using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IFaceEnrollmentRepository
{
    Task<Citizen?> GetCitizenByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<FaceEnrollment?> GetByCitizenIdAsync(Guid citizenId, CancellationToken cancellationToken);
    Task AddAsync(FaceEnrollment enrollment, CancellationToken cancellationToken);
    Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}