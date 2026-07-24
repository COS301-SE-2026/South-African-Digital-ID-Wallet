using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ManageUserAccountRepository : IManageUserAccountRepository
{
    private readonly AppDbContext _context;

    public ManageUserAccountRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Citizens
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task UpdateAsync(Citizen citizen)
    {
        _context.Citizens.Update(citizen);
        await _context.SaveChangesAsync();
    }
}