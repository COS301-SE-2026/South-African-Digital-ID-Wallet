using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class QrDisclosureTokenRepository : IQrDisclosureTokenRepository
{
    private readonly AppDbContext _context;

    public QrDisclosureTokenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(QrDisclosureToken token)
    {
        await _context.QrDisclosureTokens.AddAsync(token);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> TryMarkUsedAsync(Guid jti)
    {
        var rowsAffected = await _context.QrDisclosureTokens
            .Where(q => q.Jti == jti && q.UsedAt == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(q => q.UsedAt, DateTime.UtcNow));

        return rowsAffected == 1;
    }
}