using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class SigningKeyRepository : ISigningKeyRepository
{
    private readonly AppDbContext _context;

    public SigningKeyRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SigningKey?> GetActiveKeyAsync(SigningKeyPurpose purpose)
    {
        return await _context.SigningKeys
            .FirstOrDefaultAsync(k => k.Purpose == purpose && k.Status == SigningKeyStatus.Active);
    }

    public async Task<SigningKey?> GetByKidAsync(string kid)
    {
        return await _context.SigningKeys
            .FirstOrDefaultAsync(k => k.Kid == kid);
    }

    public Task AddAsync(SigningKey key)
    {
        _context.SigningKeys.Add(key);
        return Task.CompletedTask;
    }

    public void Update(SigningKey key)
    {
        _context.SigningKeys.Update(key);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}