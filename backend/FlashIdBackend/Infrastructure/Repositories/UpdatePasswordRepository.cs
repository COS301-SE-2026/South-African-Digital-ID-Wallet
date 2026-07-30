using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class UpdatePasswordRepository : IUpdatePasswordRepository
{
    private readonly AppDbContext _context;

    public UpdatePasswordRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        return await _context.DomainUsers
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public Task UpdateUserAsync(User user)
    {
        _context.DomainUsers.Update(user);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}