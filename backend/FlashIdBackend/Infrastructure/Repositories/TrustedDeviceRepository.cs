using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class TrustedDeviceRepository : ITrustedDeviceRepository
{
    private readonly AppDbContext _context;

    public TrustedDeviceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetCitizenByUserIdAsync(Guid userId)
    {
        return await _context.Citizens
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task<List<TrustedDevice>> GetTrustedDevicesByCitizenIdAsync(Guid citizenId)
    {
        return await _context.TrustedDevices
            .AsNoTracking()
            .Where(td => td.CitizenId == citizenId)
            .OrderByDescending(td => td.LastActive)
            .ToListAsync();
    }
}