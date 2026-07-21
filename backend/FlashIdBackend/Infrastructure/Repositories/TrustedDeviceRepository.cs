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

    public async Task<bool> UnlinkDeviceAsync(Guid userId, Guid deviceId)
    {
        var citizen = await _context.Citizens
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (citizen == null)
            return false;

        var device = await _context.TrustedDevices
            .FirstOrDefaultAsync(d =>
                d.Id == deviceId &&
                d.CitizenId == citizen.Id);

        if (device == null)
            return false;

        _context.TrustedDevices.Remove(device);

        await _context.SaveChangesAsync();

        return true;
    }
}