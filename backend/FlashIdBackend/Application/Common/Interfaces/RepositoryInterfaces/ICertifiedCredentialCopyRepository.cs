using Domain.Entities;
namespace Application.Common.Interfaces.RepositoryInterfaces;
public interface ICertifiedCredentialCopyRepository
{
    Task<CertifiedCredentialCopy?> GetByIdAsync(Guid id);
    Task<CertifiedCredentialCopy?> GetByVerificationTokenHashAsync(string tokenHash);
    Task<CertifiedCredentialCopy?> GetByDocumentHashAsync(string documentHash);
    Task AddAsync(CertifiedCredentialCopy certifiedCopy);
    Task SaveChangesAsync();
}
