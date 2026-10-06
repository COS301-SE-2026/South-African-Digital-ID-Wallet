using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IRefreshTokenRepository
{
    Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken);
    Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken);
    Task RevokeFamilyAsync(Guid familyId, DateTime revokedAt, CancellationToken cancellationToken);
    Task RemoveStaleAsync(Guid userId, DateTime now, DateTime revokedBefore, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
