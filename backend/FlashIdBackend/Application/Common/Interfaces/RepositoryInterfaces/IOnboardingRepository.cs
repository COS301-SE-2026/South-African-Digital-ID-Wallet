using Domain.Entities;
namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IOnboardingRepository
{
    Task<Citizen?> GetCitizenBySaIdAsync(string saId);

    Task<User?> GetUserByEmailAsync(string email);

    Task AddUserAsync(User user);
    Task AddCitizenAsync(Citizen citizen);
    Task SaveChangesAsync();
}