using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IFraudDetectionRepository
{
    Task<User?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<UserSecurityProfile?> GetProfileAsync(Guid userId, CancellationToken cancellationToken);
    Task<UserSecurityProfile> GetOrCreateProfileAsync(Guid userId, CancellationToken cancellationToken);
    Task<SecurityEvent?> GetLatestLocatedEventAsync(Guid userId, DateTime since, CancellationToken cancellationToken);
    Task<bool> HasSeenDeviceAsync(Guid userId, string deviceTokenHash, CancellationToken cancellationToken);
    Task<TrustedDevice?> GetTrustedDeviceAsync(Guid userId, string deviceTokenHash, CancellationToken cancellationToken);
    Task<int> CountTrustedDevicesAsync(Guid userId, CancellationToken cancellationToken);
    Task<int> RemoveTrustedDeviceAsync(Guid userId, string deviceTokenHash, CancellationToken cancellationToken);
    Task<int> RemoveTrustedDevicesExceptAsync(Guid userId, string? keepDeviceTokenHash, CancellationToken cancellationToken);
    Task<int> CountFailedLoginsSinceAsync(Guid userId, DateTime since, CancellationToken cancellationToken);
    Task<List<SecurityEvent>> GetRecentEventsAsync(Guid userId, int take, CancellationToken cancellationToken);
    Task<List<FraudAlert>> GetAlertsAsync(Guid userId, FraudAlertStatus? status, int take, CancellationToken cancellationToken);
    Task<int> CountAlertsAsync(Guid userId, FraudAlertStatus status, CancellationToken cancellationToken);
    Task<FraudAlert?> GetAlertAsync(Guid userId, Guid alertId, CancellationToken cancellationToken);
    Task<Guid?> GetCitizenIdByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task AddSecurityEventAsync(SecurityEvent securityEvent, CancellationToken cancellationToken);
    Task AddFraudAlertAsync(FraudAlert alert, CancellationToken cancellationToken);
    Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken);
    Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
