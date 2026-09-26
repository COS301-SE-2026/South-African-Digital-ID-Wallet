using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface ISigningKeyRepository
{
    Task<SigningKey?> GetActiveKeyAsync(SigningKeyPurpose purpose);
    Task<SigningKey?> GetByKidAsync(string kid);
    Task AddAsync(SigningKey key);
    void Update(SigningKey key);
    Task SaveChangesAsync();
}