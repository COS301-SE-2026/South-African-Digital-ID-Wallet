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

    public async Task<PhysicalIdentityVerification> GetByIdAsync(Guid verificationId,
         CancellationToken cancellationToken)
    {
        return await _context.PhysicalIdentityVerifications.FirstOrDefaultAsync(x => x.Id == verificationId, cancellationToken);
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
        _context.SaveChangesAsync(cancellationToken);
    }
}