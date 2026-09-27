using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CertifiedCredentialCopyRepository : ICertifiedCredentialCopyRepository
{

    private readonly AppDbContext _context;

    public CertifiedCredentialCopyRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CertifiedCredentialCopy?> GetByIdAsync(Guid id)
    {
        return await _context.CertifiedCredentialCopies.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<CertifiedCredentialCopy?> GetByVerificationTokenHashAsync(string tokenHash)
    {
        return await _context.CertifiedCredentialCopies.AsNoTracking()
            .Include(c => c.Credential)
            .ThenInclude(c => c.Citizen)
            .Include(c => c.Credential)
            .ThenInclude(c => c.IdentityDocument)
            .Include(c => c.Credential)
            .ThenInclude(c => c.DriversLicense)
            .FirstOrDefaultAsync(c => c.VerificationTokenHash == tokenHash);
    }

    public async Task AddAsync(CertifiedCredentialCopy certifiedCopy)
    {
        await _context.CertifiedCredentialCopies.AddAsync(certifiedCopy);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}