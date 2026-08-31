using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class FaceEnrollmentRepository : IFaceEnrollmentRepository
{
    private readonly AppDbContext _context;
    public FaceEnrollmentRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<Citizen?> GetCitizenByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Citizens.Include(citizen => citizen.FaceEnrollment).FirstOrDefaultAsync(citizen => citizen.UserId == userId, cancellationToken);
    }
    public async Task<FaceEnrollment?> GetByCitizenIdAsync(Guid citizenId, CancellationToken cancellationToken)
    {
        return await _context.FaceEnrollments.FirstOrDefaultAsync(enrollment => enrollment.CitizenId == citizenId, cancellationToken);
    }
    public async Task AddAsync(FaceEnrollment enrollment, CancellationToken cancellationToken)
    {
        await _context.FaceEnrollments.AddAsync(enrollment, cancellationToken);
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