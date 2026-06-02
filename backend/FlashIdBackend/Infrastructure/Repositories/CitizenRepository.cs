
using Application.Common.Interfaces.RepositoryInterfaces;

using Domain.Entities;

using Infrastructure.Data;

using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class CitizenRepository : ICitizenRepository //IMPLEMENTS Application's interface
{
    private readonly AppDbContext _context;

    public CitizenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetCitizenBySaIdWithUserAsync(string saId)
    {
        // Include() is EF Core's eager-loading method.
        // We load User alongside Citizen so the Application service can
        // access citizen.User.Username without a second DB round-trip.
        return await _context.Citizens
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.SaId == saId);
    }

    public async Task<bool> IsUsernameTakenAsync(string username, Guid excludeUserId)
    {
        // AnyAsync returns true if at least one record matches — efficient because
        // it stops scanning after the first match (SELECT TOP 1 in SQL).
        return await _context.DomainUsers
            .AnyAsync(u => u.Username == username && u.Id != excludeUserId);
    }

    public Task UpdateCitizenAsync(Citizen citizen)
    {
        _context.Citizens.Update(citizen);
        return Task.CompletedTask;
    }

    public Task UpdateUserAsync(User user)
    {
        _context.DomainUsers.Update(user);
        return Task.CompletedTask;
    }

    public Task AddAuditLogAsync(AuditLog auditLog)
    {
        _context.AuditLogs.Add(auditLog);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}