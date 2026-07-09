using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly AppDbContext _context;

    public AuthRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.DomainUsers
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        return await _context.DomainUsers.FindAsync(userId);
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
