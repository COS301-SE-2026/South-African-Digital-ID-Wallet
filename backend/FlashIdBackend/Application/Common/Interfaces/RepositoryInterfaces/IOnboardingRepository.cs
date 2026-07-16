using Domain.Entities;
namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IOnboardingRepository
{
    Task<Citizen?> GetCitizenBySaIdAsync(string saId);
    Task<User?> GetUserByEmailAsync(string email);
    Task AddCitizenAsync(Citizen citizen);
    Task AddAuditLogAsync(AuditLog auditLog);
    Task AddActivationAsync(CitizenActivation citizenActivation);
    Task SaveChangesAsync();
}