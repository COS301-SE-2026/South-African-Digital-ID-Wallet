using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext _context;

    public RefreshTokenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken)
    {
        await _context.RefreshTokens.AddAsync(refreshToken, cancellationToken);
    }

    public async Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken)
    {
        return await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);
    }

    public async Task RevokeFamilyAsync(Guid familyId, DateTime revokedAt, CancellationToken cancellationToken)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(t => t.FamilyId == familyId && t.RevokedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var token in activeTokens)
        {
            token.RevokedAt = revokedAt;
            token.UpdatedAt = revokedAt;
        }
    }

    public async Task RemoveStaleAsync(Guid userId, DateTime now, DateTime revokedBefore, CancellationToken cancellationToken)
    {
        var staleTokens = await _context.RefreshTokens
            .Where(t => t.UserId == userId && (t.ExpiresAt <= now || t.RevokedAt < revokedBefore))
            .ToListAsync(cancellationToken);

        _context.RefreshTokens.RemoveRange(staleTokens);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
