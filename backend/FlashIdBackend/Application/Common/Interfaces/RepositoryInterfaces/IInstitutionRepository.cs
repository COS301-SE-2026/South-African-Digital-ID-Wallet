using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IInstitutionRepository
{
    Task<GovernmentAdministrator?> GetAdminByIdAsync(Guid adminId);
    Task<bool> InstitutionExistsByVerificationNumberAsync(string verificationNumber);
    Task AddInstitutionAsync(Institution institution);
    Task AddAuditLogAsync(AuditLog auditLog);
    Task<List<Institution>> GetAllInstitutionsAsync();
    Task<Institution?> GetInstitutionByIdAsync(Guid id);
    Task SaveChangesAsync();
}