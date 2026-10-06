using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IRefreshTokenRepository
{
    Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken);
    Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken);
    Task<bool> TryMarkRotatedAsync(Guid tokenId, Guid replacedByTokenId, DateTime rotatedAt, CancellationToken cancellationToken);
    Task RevokeFamilyAsync(Guid familyId, DateTime revokedAt, CancellationToken cancellationToken);
    Task RemoveExpiredAsync(Guid userId, DateTime now, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
