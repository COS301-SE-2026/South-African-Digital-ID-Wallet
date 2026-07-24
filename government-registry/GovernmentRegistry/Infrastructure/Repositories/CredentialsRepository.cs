using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CredentialsRepository : ICredentialsRepository
{
    private readonly AppDbContext _context;
    public CredentialsRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IdentityDocument?> GetIdentityDocumentBySaIdAsync(string saId, CancellationToken cancellationToken)
    {
        return await _context.IdentityDocuments.AsNoTracking()
            .Include(document => document.Citizen)
            .FirstOrDefaultAsync(document => document.Citizen.SaId == saId, cancellationToken);
    }
    public async Task<DriversLicense?> GetDriversLicenseBySaIdAsync(string saId, CancellationToken cancellationToken)
    {
        return await _context.DriversLicenses.AsNoTracking()
            .Include(document => document.Citizen)
            .FirstOrDefaultAsync(license => license.Citizen.SaId == saId, cancellationToken);
    }
}