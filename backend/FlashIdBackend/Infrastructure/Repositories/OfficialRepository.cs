using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class OfficialRepository : IOfficialRepository
{
    private readonly AppDbContext _context;

    public OfficialRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Official?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Officials
            .Include(o => o.Institution)
            .FirstOrDefaultAsync(o => o.UserId == userId);
    }

    public async Task<Official?> GetByIdAsync(Guid id)
    {
        return await _context.Officials
            .Include(o => o.Institution)
            .FirstOrDefaultAsync(o => o.Id == id);
    }
}