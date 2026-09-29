using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class VerificationRepository : IVerificationRepository
{
    private readonly AppDbContext _context;
    public VerificationRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<Citizen?> GetCitizenByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Citizens.FirstOrDefaultAsync(citizen => citizen.UserId == userId, cancellationToken);
    }

    public async Task<CitizenActivation?> GetActivationByTokenHashAsync(string tokenHash,
        CancellationToken cancellationToken)
    {
        return await _context.CitizenActivations.Include(activation => activation.Citizen).FirstOrDefaultAsync(activation => activation.TokenHash == tokenHash, cancellationToken);
    }

    public async Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken)
    {
        await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}