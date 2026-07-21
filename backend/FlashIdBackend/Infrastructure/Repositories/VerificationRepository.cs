using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;

namespace Infrastructure.Repositories;

public class VerificationRepository : IVerificationRepository
{
    public async Task<Citizen?> GetCitizenByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return new Citizen();
    }

    public async Task<CitizenActivation?> GetActivationByTokenHashAsync(string tokenHash,
        CancellationToken cancellationToken)
    {
        return new CitizenActivation();
    }

    public Task AddAuditLogAsync(AuditLog auditLog, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}