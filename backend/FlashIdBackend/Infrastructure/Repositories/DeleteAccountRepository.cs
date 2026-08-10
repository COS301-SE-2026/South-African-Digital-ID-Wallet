using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class DeleteAccountRepository : IDeleteAccountRepository
{
    private readonly AppDbContext _context;

    public DeleteAccountRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApplicationUser?> GetUserByIdAsync(Guid userId)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId.ToString());
    }

    public async Task<Citizen?> GetCitizenByUserIdAsync(Guid userId)
    {
        return await _context.Citizens
            .FirstOrDefaultAsync(c =>
                c.UserId.HasValue &&
                c.UserId.Value == userId);
    }

    public async Task DeleteCredentialsAsync(Guid citizenId)
    {
        var credentials = await _context.Credentials
            .Where(c => c.CitizenId == citizenId)
            .ToListAsync();

        _context.Credentials.RemoveRange(credentials);
    }

    public async Task DeleteTrustedDevicesAsync(Guid citizenId)
    {
        var trustedDevices = await _context.TrustedDevices
            .Where(d => d.UserId == citizenId)
            .ToListAsync();

        _context.TrustedDevices.RemoveRange(trustedDevices);
    }

    public async Task DeleteNotificationsAsync(Guid citizenId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.CitizenId == citizenId)
            .ToListAsync();

        _context.Notifications.RemoveRange(notifications);
    }

    public async Task DeleteAuditLogsAsync(Guid userId)
    {
        var auditLogs = await _context.AuditLogs
            .Where(a => a.ActorId == userId)
            .ToListAsync();

        _context.AuditLogs.RemoveRange(auditLogs);
    }

    public Task DeleteCitizenAsync(Citizen citizen)
    {
        _context.Citizens.Remove(citizen);

        return Task.CompletedTask;
    }

    public async Task DeleteUserAsync(Guid userId)
    {
        var domainUser = await _context.Set<Domain.Entities.User>()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (domainUser != null)
        {
            domainUser.IsDeleted = true;
        }

        var identityUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId.ToString());

        if (identityUser != null)
        {
            _context.Users.Remove(identityUser);
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteQrDisclosureTokensAsync(Guid citizenId)
    {
        var credentialIds = await _context.Credentials
            .Where(c => c.CitizenId == citizenId)
            .Select(c => c.Id)
            .ToListAsync();

        var tokens = await _context.QrDisclosureTokens
            .Where(t => credentialIds.Contains(t.CredentialId))
            .ToListAsync();

        _context.QrDisclosureTokens.RemoveRange(tokens);
    }
}