using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CredentialExpiryRepository : JobRunRepositoryBase, ICredentialExpiryRepository
{
    public CredentialExpiryRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<List<Credential>> GetExpiredActiveCredentialsPageAsync(DateTime asOfUtc, Guid afterId, int pageSize, CancellationToken cancellationToken)
    {
        return await Context.Credentials
            .Include(c => c.DriversLicense)
            .Where(c => c.Status == CredentialStatus.Active
                && c.DriversLicense != null
                && c.DriversLicense.ExpiryDate <= asOfUtc
                && c.Id > afterId)
            .OrderBy(c => c.Id)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken)
    {
        await Context.AuditLogs.AddAsync(auditLog, cancellationToken);
    }

    public async Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken)
    {
        await Context.Notifications.AddAsync(notification, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await Context.SaveChangesAsync(cancellationToken);
    }
}
