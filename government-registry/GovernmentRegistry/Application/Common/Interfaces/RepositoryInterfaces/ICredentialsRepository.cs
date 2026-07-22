using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICredentialsRepository
{
    Task<Credential?> GetIdentityDocumentBySaIdAsync(string saId, CancellationToken cancellationToken);
    Task<Credential?> GetDriversLicenseBySaIdAsync(string saId, CancellationToken cancellationToken);
    
}