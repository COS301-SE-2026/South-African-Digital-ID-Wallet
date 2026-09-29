using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Features.ActivityOverview.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ActivityOverviewRepository : IActivityOverviewRepository
{
    private readonly AppDbContext _context;

    public ActivityOverviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Citizen?> GetCitizenByUserIdAsync(Guid userId)
    {
        return await _context.Citizens
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task<List<ActivityOverviewDto>> GetActivityByUserIdAsync(Guid userId)
    {
        return await _context.AuditLogs
            .AsNoTracking()
            .Where(a => a.ActorId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new ActivityOverviewDto
            {
                Id = a.Id,
                Title = a.Details,
                Timestamp = DateTime.SpecifyKind(a.CreatedAt, DateTimeKind.Utc),
                Type = a.EventType.ToString()
            })
            .ToListAsync();
    }
}