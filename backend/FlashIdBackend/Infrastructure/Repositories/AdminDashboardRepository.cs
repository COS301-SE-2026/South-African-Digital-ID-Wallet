using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Features.AdminDashboard.DTOs;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class AdminDashboardRepository : IAdminDashboardRepository
{
    private static readonly HashSet<AuditEventType> SystemLevelEvents = new()
    {
        AuditEventType.UserRegistered,
        AuditEventType.InstitutionRegistered,
        AuditEventType.OfficialVerified,
        AuditEventType.AccountDeleted,
        AuditEventType.CredentialIssued,
        AuditEventType.CredentialRevoked,
        AuditEventType.EmailAddressChanged,
    };

    private readonly AppDbContext _context;

    public AdminDashboardRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardCountsDto> GetCountsAsync()
    {
        return new DashboardCountsDto
        {
            Users = await _context.DomainUsers.CountAsync(),
            Institutions = await _context.Institutions.CountAsync(),
            CredentialsIssued = await _context.Credentials.CountAsync(),
        };
    }

    public async Task<List<AdminActivityItemDto>> GetGlobalActivityFeedAsync(int limit)
    {
        return await _context.AuditLogs
            .AsNoTracking()
            .Where(a => SystemLevelEvents.Contains(a.EventType))
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .Select(a => new AdminActivityItemDto
            {
                Id = a.Id,
                EventType = a.EventType.ToString(),
                Details = a.Details,
                CreatedAt = DateTime.SpecifyKind(a.CreatedAt, DateTimeKind.Utc),
            })
            .ToListAsync();
    }

    public async Task<List<DailyPointDto>> GetEventSeriesAsync(AuditEventType eventType, DateTime fromDate, DateTime toDate)
    {
        var points = await _context.AuditLogs
            .AsNoTracking()
            .Where(a => a.EventType == eventType && a.CreatedAt >= fromDate && a.CreatedAt <= toDate)
            .GroupBy(a => a.CreatedAt.Date)
            .Select(g => new DailyPointDto
            {
                Date = DateOnly.FromDateTime(g.Key),
                Count = g.Count()
            })
            .OrderBy(p => p.Date)
            .ToListAsync();
        return ZeroFillDays(points, fromDate, toDate);
    }

    public async Task<List<DailyPointDto>> GetCredentialsIssuedSeriesAsync(DateTime fromDate, DateTime toDate)
    {
        var points = await _context.Credentials
            .AsNoTracking()
            .Where(a => a.CreatedAt >= fromDate && a.CreatedAt <= toDate)
            .GroupBy(c => c.CreatedAt.Date)
            .Select(g => new DailyPointDto
            {
                Date = DateOnly.FromDateTime(g.Key),
                Count = g.Count()
            })
            .OrderBy(p => p.Date)
            .ToListAsync();
        return ZeroFillDays(points, fromDate, toDate);
    }

    public async Task<List<DailyPointDto>> GetActiveOfficialsSeriesAsync(DateTime fromDate, DateTime toDate)
    {
        var query =
            from log in _context.AuditLogs.AsNoTracking()
            join official in _context.Officials.AsNoTracking() on log.ActorId equals official.UserId
            where log.CreatedAt >= fromDate && log.CreatedAt <= toDate
            select new { log.CreatedAt, official.Id };

        var points = await query
            .GroupBy(x => x.CreatedAt.Date)
            .Select(g => new DailyPointDto
            {
                Date = DateOnly.FromDateTime(g.Key),
                Count = g.Select(x => x.Id).Distinct().Count()
            })
            .OrderBy(p => p.Date)
            .ToListAsync();
        return ZeroFillDays(points, fromDate, toDate);
    }

    public async Task<List<DailyPointDto>> GetActiveInstitutionsSeriesAsync(DateTime fromDate, DateTime toDate)
    {
        var query =
            from log in _context.AuditLogs.AsNoTracking()
            join official in _context.Officials.AsNoTracking() on log.ActorId equals official.UserId
            where log.CreatedAt >= fromDate && log.CreatedAt <= toDate
            select new { log.CreatedAt, official.InstitutionId };

        var points = await query
            .GroupBy(x => x.CreatedAt.Date)
            .Select(g => new DailyPointDto
            {
                Date = DateOnly.FromDateTime(g.Key),
                Count = g.Select(x => x.InstitutionId).Distinct().Count()
            })
            .OrderBy(p => p.Date)
            .ToListAsync();
        return ZeroFillDays(points, fromDate, toDate);
    }

    private static List<DailyPointDto> ZeroFillDays(List<DailyPointDto> points, DateTime fromDate, DateTime toDate)
    {
        var byDate = points.ToDictionary(p => p.Date, p => p.Count);
        var result = new List<DailyPointDto>();
        for (var date = DateOnly.FromDateTime(fromDate); date <= DateOnly.FromDateTime(toDate); date = date.AddDays(1))
        {
            result.Add(new DailyPointDto
            {
                Date = date,
                Count = byDate.GetValueOrDefault(date, 0),
            });
        }
        return result;
    }
}