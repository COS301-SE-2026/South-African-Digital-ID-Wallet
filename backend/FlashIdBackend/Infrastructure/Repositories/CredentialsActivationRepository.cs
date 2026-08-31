using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CredentialsActivationRepository : ICredentialsActivationRepository
{
    private readonly AppDbContext _context;

    public CredentialsActivationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetCitizenBySaIdAsync(string saId, CancellationToken cancellationToken)
    {
        return await _context.Citizens
            .Include(c => c.User)
            .Include(c => c.Credentials).ThenInclude(ct => ct.IdentityDocument)
            .Include(c => c.Credentials).ThenInclude(ct => ct.DriversLicense)
            .FirstOrDefaultAsync(c => c.SaId == saId, cancellationToken);
    }

    public async Task AddIdentityDocumentAsync(IdentityDocument identityDocument, CancellationToken cancellationToken)
    {
        await _context.IdentityDocuments.AddAsync(identityDocument, cancellationToken);
    }

    public async Task<bool> HasIdentityDocumentAsync(Guid citizenId, CancellationToken cancellationToken)
    {
        return await _context.IdentityDocuments.AnyAsync(i => i.Credential.CitizenId == citizenId, cancellationToken);
    }

    public async Task AddDriversLicenseAsync(DriversLicense driversLicense, CancellationToken cancellationToken)
    {
        await _context.DriversLicenses.AddAsync(driversLicense, cancellationToken);
    }

    public async Task<bool> HasDriversLicenseAsync(Guid citizenId, CancellationToken cancellationToken)
    {
        return await _context.DriversLicenses.AnyAsync(d => d.Credential.CitizenId == citizenId && d.Credential.Status == CredentialStatus.Active, cancellationToken);
    }

    public async Task AddCredentialAsync(Credential credential, CancellationToken cancellationToken)
    {
        await _context.Credentials.AddAsync(credential, cancellationToken);
    }

    public async Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken)
    {
        await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
    }

    public async Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken)
    {
        await _context.Notifications.AddAsync(notification, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}