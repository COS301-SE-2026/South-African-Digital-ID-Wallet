using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Features.Citizens.Dtos;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CitizenRecordRepository : ICitizenRecordRepository
{
    private readonly AppDbContext _context;

    public CitizenRecordRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CitizenRecord> GetCitizenRecord(string saId)
    {
        return await _context.CitizenRecords
             .FirstOrDefaultAsync(c => c.SaId == saId);

    }
}