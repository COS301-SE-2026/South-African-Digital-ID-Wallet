using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class FraudDetectionRepository : IFraudDetectionRepository
{
    private readonly AppDbContext _context;

    public FraudDetectionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.DomainUsers.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
    }

    public async Task<UserSecurityProfile?> GetProfileAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.UserSecurityProfiles.FindAsync([userId], cancellationToken);
    }

    public async Task<UserSecurityProfile> GetOrCreateProfileAsync(Guid userId, CancellationToken cancellationToken)
    {
        var profile = await GetProfileAsync(userId, cancellationToken);
        if (profile is not null)
        {
            return profile;
        }

        profile = new UserSecurityProfile
        {
            UserId = userId,
            ImpossibleTravelDetectionEnabled = true,
            EnhancedVerificationEnabled = false,
            UpdatedAt = DateTime.UtcNow,
        };

        await _context.UserSecurityProfiles.AddAsync(profile, cancellationToken);
        return profile;
    }

    public async Task<SecurityEvent?> GetLatestLocatedEventAsync(Guid userId, DateTime since, CancellationToken cancellationToken)
    {
        return await _context.SecurityEvents
            .AsNoTracking()
            .Where(e => e.UserId == userId
                        && e.OccurredAt >= since
                        && e.Latitude != null
                        && e.Longitude != null)
            .OrderByDescending(e => e.OccurredAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> HasSeenDeviceAsync(Guid userId, string deviceTokenHash, CancellationToken cancellationToken)
    {
        return await _context.SecurityEvents
            .AnyAsync(e => e.UserId == userId && e.DeviceTokenHash == deviceTokenHash, cancellationToken);
    }

    public async Task<TrustedDevice?> GetTrustedDeviceAsync(Guid userId, string deviceTokenHash, CancellationToken cancellationToken)
    {
        return await _context.TrustedDevices
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.UserId == userId && d.DeviceTokenHash == deviceTokenHash && d.IsTrusted, cancellationToken);
    }

    public async Task<int> CountTrustedDevicesAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.TrustedDevices.CountAsync(d => d.UserId == userId && d.IsTrusted, cancellationToken);
    }

    public async Task<int> RemoveTrustedDeviceAsync(Guid userId, string deviceTokenHash, CancellationToken cancellationToken)
    {
        var devices = await _context.TrustedDevices
            .Where(d => d.UserId == userId && d.DeviceTokenHash == deviceTokenHash)
            .ToListAsync(cancellationToken);

        _context.TrustedDevices.RemoveRange(devices);
        return devices.Count;
    }

    public async Task<int> RemoveTrustedDevicesExceptAsync(Guid userId, string? keepDeviceTokenHash, CancellationToken cancellationToken)
    {
        var devices = await _context.TrustedDevices
            .Where(d => d.UserId == userId && (keepDeviceTokenHash == null || d.DeviceTokenHash != keepDeviceTokenHash))
            .ToListAsync(cancellationToken);

        _context.TrustedDevices.RemoveRange(devices);
        return devices.Count;
    }

    public async Task<int> CountFailedLoginsSinceAsync(Guid userId, DateTime since, CancellationToken cancellationToken)
    {
        return await _context.AuditLogs.CountAsync(a =>
            a.ActorId == userId &&
            a.EventType == AuditEventType.FailedLoginAttempt &&
            a.CreatedAt >= since, cancellationToken);
    }

    public async Task<List<SecurityEvent>> GetRecentEventsAsync(Guid userId, int take, CancellationToken cancellationToken)
    {
        return await _context.SecurityEvents
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.OccurredAt)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<FraudAlert>> GetAlertsAsync(Guid userId, FraudAlertStatus? status, int take, CancellationToken cancellationToken)
    {
        return await _context.FraudAlerts
            .AsNoTracking()
            .Include(a => a.SecurityEvent)
            .Include(a => a.PreviousSecurityEvent)
            .Where(a => a.UserId == userId && (status == null || a.Status == status))
            .OrderByDescending(a => a.CreatedAt)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountAlertsAsync(Guid userId, FraudAlertStatus status, CancellationToken cancellationToken)
    {
        return await _context.FraudAlerts.CountAsync(a => a.UserId == userId && a.Status == status, cancellationToken);
    }

    public async Task<FraudAlert?> GetAlertAsync(Guid userId, Guid alertId, CancellationToken cancellationToken)
    {
        return await _context.FraudAlerts
            .Include(a => a.SecurityEvent)
            .Include(a => a.PreviousSecurityEvent)
            .FirstOrDefaultAsync(a => a.Id == alertId && a.UserId == userId, cancellationToken);
    }

    public async Task<Guid?> GetCitizenIdByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Citizens
            .Where(c => c.UserId == userId)
            .Select(c => (Guid?)c.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddSecurityEventAsync(SecurityEvent securityEvent, CancellationToken cancellationToken)
    {
        await _context.SecurityEvents.AddAsync(securityEvent, cancellationToken);
    }

    public async Task AddFraudAlertAsync(FraudAlert alert, CancellationToken cancellationToken)
    {
        await _context.FraudAlerts.AddAsync(alert, cancellationToken);
    }

    public async Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken)
    {
        await _context.Notifications.AddAsync(notification, cancellationToken);
    }

    public async Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken)
    {
        await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
