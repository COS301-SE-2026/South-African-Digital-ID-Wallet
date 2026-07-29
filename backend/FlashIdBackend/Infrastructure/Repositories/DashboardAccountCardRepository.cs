using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class DashboardAccountCardRepository : IDashboardAccountCardRepository
{
    private readonly AppDbContext _context;

    public DashboardAccountCardRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetCitizenByUserIdAsync(Guid userId)
    {
        return await _context.Citizens
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }
}