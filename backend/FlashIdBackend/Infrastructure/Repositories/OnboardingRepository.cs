using Domain.Entities;
using Infrastructure.Data;
using Application.Common.Interfaces.RepositoryInterfaces;
using Microsoft.EntityFrameworkCore;
namespace Infrastructure.Repositories;

public class OnboardingRepository : IOnboardingRepository //IMPLEMENTS Application's interface
{
    private readonly AppDbContext _context;

    public OnboardingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetCitizenBySaIdAsync(string saId)
    {
        return await _context.Citizens.FirstOrDefaultAsync(c => c.SaId == saId);
    }

    public Task AddUserAsync(User user)
    {
        // YOUR method: AddUser
        // EF Core method inside: .Add()  <-  these are intentionally different names
        _context.DomainUsers.Add(user);
        return Task.CompletedTask;
    }

    public Task AddCitizenAsync(Citizen citizen)
    {
        // YOUR method: AddCitizen
        // EF Core method inside: .Add()
        _context.Citizens.Add(citizen);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}