using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CredentialRepository : ICredentialRepository
{
    private readonly AppDbContext _context;

    public CredentialRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetCitizenByUserIdAsync(Guid userId)
    {
        return await _context.Citizens
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task<List<Credential>> GetCredentialsByCitizenIdAsync(Guid citizenId)
    {
        return await _context.Credentials
            .AsNoTracking()
            .Include(c => c.IdentityDocument)
            .Include(c => c.DriversLicense)
            .Where(c => c.CitizenId == citizenId)
            .OrderBy(c => c.IssueDate)
            .ToListAsync();
    }

    public async Task<Credential?> GetByIdAsync(Guid id)
    {
        return await _context.Credentials
            .Include(c => c.Citizen)
            .Include(c => c.IdentityDocument)
            .Include(c => c.DriversLicense)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<Credential>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Credentials
            .Include(c => c.Citizen)
            .Include(c => c.IdentityDocument)
            .Include(c => c.DriversLicense)
            .Where(c => c.Citizen.UserId == userId)
            .ToListAsync();
    }

    public async Task<Citizen?> GetCitizenByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Citizens.FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
    }
}
