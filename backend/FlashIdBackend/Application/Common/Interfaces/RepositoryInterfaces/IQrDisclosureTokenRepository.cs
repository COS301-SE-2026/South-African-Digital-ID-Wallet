using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IQrDisclosureTokenRepository
{
    Task AddAsync(QrDisclosureToken token);
    Task<bool> TryMarkUsedAsync(Guid jti);
    Task InvalidateActiveTokensForCredentialAsync(Guid credentialId);

    Task<int> PurgeExpiredAsync(DateTime olderThan);
}