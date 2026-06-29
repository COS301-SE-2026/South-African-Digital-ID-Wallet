
using Application.Common.Interfaces.RepositoryInterfaces;

using Domain.Entities;

using Infrastructure.Data;

using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class CitizenRepository : ICitizenRepository
{
    private readonly AppDbContext _context;

    public CitizenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> IsEmailTakenAsync(string email, Guid excludeUserId)
    {
        return await _context.DomainUsers
            .AnyAsync(u => u.Email == email && u.Id != excludeUserId);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.DomainUsers
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public Task AddUserAync(User user)
    {
        _context.DomainUsers.Add(user);
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