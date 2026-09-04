using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class PhysicalIdentityVerificationRepository : IPhysicalIdentityVerificationRepository
{
    private readonly AppDbContext _context;

    public PhysicalIdentityVerificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetCitizenBySaIdAsync(string saId, CancellationToken cancellationToken)
    {
        return await _context.Citizens.FirstOrDefaultAsync(c => c.SaId == saId);
    }

    public async Task<Citizen?> GetCitizenByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Citizens.FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.DomainUsers.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<PhysicalIdentityVerification?> GetByIdAsync(Guid verificationId,
         CancellationToken cancellationToken)
    {
        return await _context.PhysicalIdentityVerifications.FirstOrDefaultAsync(x => x.Id == verificationId, cancellationToken);
    }

    public async Task AddCitizenAsync(Citizen citizen, CancellationToken cancellationToken)
    {
        await _context.Citizens.AddAsync(citizen, cancellationToken);
    }

    public async Task<PhysicalIdentityVerification?> GetActiveForUserAsync(Guid userId,
         CancellationToken cancellationToken)
    {
        return await _context.PhysicalIdentityVerifications.Where(x => x.UserId == userId &&
                                                                       x.Status != IdentityVerificationStatus.Verified &&
                                                                       x.Status != IdentityVerificationStatus.Failed &&
                                                                       x.Status != IdentityVerificationStatus.Expired)
             .OrderByDescending(x => x.CreatedAt)
             .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(PhysicalIdentityVerification verification, CancellationToken cancellationToken)
    {
        await _context.PhysicalIdentityVerifications.AddAsync(verification, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}