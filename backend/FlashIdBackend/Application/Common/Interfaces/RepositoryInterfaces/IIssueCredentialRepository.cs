using Application.Features.Credentials.Enums;
using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IIssueCredentialRepository
{
    Task<Citizen?> GetCitizenBySaIdAsync(string saId, CancellationToken cancellationToken);
    Task<bool> HasActiveCredentialAsync(Guid citizenId, CredentialType credentialType, CancellationToken cancellationToken);
    Task AddCredentialAsync(Credential credential, CancellationToken cancellationToken);
    Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken);
    Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}