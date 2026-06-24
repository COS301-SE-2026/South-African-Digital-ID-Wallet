using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class InstitutionRepository : IInstitutionRepository
{
    private readonly AppDbContext _context;

    public InstitutionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<GovernmentAdministrator?> GetAdminByIdAsync(Guid adminId)
    {
        return await _context.GovernmentAdministrators
            .FirstOrDefaultAsync(a => a.Id == adminId);
    }

    public async Task<bool> InstitutionExistsByVerificationNumberAsync(string verificationNumber)
    {
        return await _context.Institutions
            .AnyAsync(i => i.VerificationNumber == verificationNumber);
    }

    public Task AddInstitutionAsync(Institution institution)
    {
        _context.Institutions.Add(institution);
        return Task.CompletedTask;
    }

    public Task AddAuditLogAsync(AuditLog auditLog)
    {
        _context.AuditLogs.Add(auditLog);
        return Task.CompletedTask;
    }

    public async Task<List<Institution>> GetAllInstitutionsAsync()
    {
        //in production add pagination here
        return await _context.Institutions.ToListAsync();
    }

    public async Task<Institution?> GetInstitutionByIdAsync(Guid id)
    {
        return await _context.Institutions.FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}