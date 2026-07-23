using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICredentialsActivationRepository
{
    Task AddIdentityDocumentAsync(IdentityDocument identityDocument, CancellationToken cancellationToken);
    Task<bool?> HasIdentityDocumentAsync(Guid citizenId, CancellationToken cancellationToken);
    Task AddDriversLicenseAsync(DriversLicense driversLicense, CancellationToken cancellationToken);
    Task<bool?> HasDriversLicenseAsync(Guid citizenId, CancellationToken cancellationToken);
    Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}