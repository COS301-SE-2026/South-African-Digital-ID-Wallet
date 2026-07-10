using Domain.Entities;
using Infrastructure.Data;
using Application.Common.Interfaces.RepositoryInterfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class OnboardingRepository : IOnboardingRepository //IMPLEMENTS Application's interface
{
    private readonly AppDbContext _context;

    public OnboardingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetCitizenBySaIdAsync(string saId)
    {
        return await _context.Citizens.FirstOrDefaultAsync(c => c.SaId == saId);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.DomainUsers.FirstOrDefaultAsync(u => u.Email == email);
    }

    public Task AddUserAsync(User user)
    {
        _context.DomainUsers.Add(user);
        return Task.CompletedTask;
    }

    public Task AddCitizenAsync(Citizen citizen)
    {
        _context.Citizens.Add(citizen);
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