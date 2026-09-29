using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICredentialsActivationRepository
{
    Task<Citizen?> GetCitizenBySaIdAsync(string saId, CancellationToken cancellationToken);
    Task AddIdentityDocumentAsync(IdentityDocument identityDocument, CancellationToken cancellationToken);
    Task<bool> HasIdentityDocumentAsync(Guid citizenId, CancellationToken cancellationToken);
    Task AddDriversLicenseAsync(DriversLicense driversLicense, CancellationToken cancellationToken);
    Task<bool> HasDriversLicenseAsync(Guid citizenId, CancellationToken cancellationToken);
    Task AddCredentialAsync(Credential credential, CancellationToken cancellationToken);
    Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken);
    Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}