using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ICredentialsRepository
{
    Task<IdentityDocument?> GetIdentityDocumentBySaIdAsync(string saId, CancellationToken cancellationToken);
    Task<DriversLicense?> GetDriversLicenseBySaIdAsync(string saId, CancellationToken cancellationToken);

}