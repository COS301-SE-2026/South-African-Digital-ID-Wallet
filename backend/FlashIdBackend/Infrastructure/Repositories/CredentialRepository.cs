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
    public async Task<Citizen?> GetCitizenByCitizenIdAsync(Guid citizenId)
    {
        return await _context.Citizens.FirstOrDefaultAsync(c => c.Id == citizenId);
    }
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
    public async Task<(List<Citizen> Citizens, int TotalCount)> SearchCitizensAsync(string? query, int page, int pageSize)
    {
        var citizensQuery = _context.Citizens
            .AsNoTracking()
            .Include(c => c.Credentials)
                .ThenInclude(cr => cr.DriversLicense)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalizedQuery = query.Trim().ToLower();
            citizensQuery = citizensQuery.Where(c =>
                c.Names.ToLower().Contains(normalizedQuery) ||
                c.Surname.ToLower().Contains(normalizedQuery) ||
                c.SaId.Contains(normalizedQuery));
        }

        var totalCount = await citizensQuery.CountAsync();

        var citizens = await citizensQuery
            .OrderBy(c => c.Surname)
            .ThenBy(c => c.Names)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (citizens, totalCount);
    }

}
