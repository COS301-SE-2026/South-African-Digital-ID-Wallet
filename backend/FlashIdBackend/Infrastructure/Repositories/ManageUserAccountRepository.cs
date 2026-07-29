using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ManageUserAccountRepository : IManageUserAccountRepository
{
    private readonly AppDbContext _context;

    public ManageUserAccountRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Citizens
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task UpdateAsync(Citizen citizen)
    {
        _context.Citizens.Update(citizen);
        await _context.SaveChangesAsync();
    }

    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        return await _context.DomainUsers.FirstOrDefaultAsync(u => u.Id == userId);
    }

    public Task UpdateUserAsync(User user)
    {
        _context.DomainUsers.Update(user);
        return Task.CompletedTask;
    }

    public async Task<bool> IsEmailTakenAsync(string email, Guid excludeUserId)
    {
        return await _context.DomainUsers.AnyAsync(u => u.Email == email && u.Id != excludeUserId);
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

    public async Task<bool> TryConfirmEmailChangeAsync(User user, AuditLog auditLog)
    {
        _context.DomainUsers.Update(user);
        _context.AuditLogs.Add(auditLog);

        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException)
        {
            return false;
        }
    }
}