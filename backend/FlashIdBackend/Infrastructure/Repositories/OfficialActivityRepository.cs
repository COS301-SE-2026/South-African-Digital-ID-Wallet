using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Features.Officials.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class OfficialActivityRepository : IOfficialActivityRepository
{
    private readonly AppDbContext _context;

    public OfficialActivityRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MyActivityItemDto>> GetRecentByActorAsync(Guid userId, int limit)
    {
        return await _context.AuditLogs
            .AsNoTracking()
            .Where(a => a.ActorId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .Select(a => new MyActivityItemDto
            {
                Id = a.Id,
                EventType = a.EventType.ToString(),
                Details = a.Details,
                CreatedAt = DateTime.SpecifyKind(a.CreatedAt, DateTimeKind.Utc),
            })
            .ToListAsync();
    }

    public async Task<(List<OfficialHistoryItemDto> Items, int TotalCount)> GetInstitutionHistoryAsync(
        Guid institutionId,
        string? search,
        AuditEventType? action,
        DateTime? dateFrom,
        DateTime? dateTo,
        string? type,
        int page,
        int pageSize
    )
    {
        var trimmedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim();
        var searchMatchesFailed = trimmedSearch != null && "failed".Contains(trimmedSearch, StringComparison.OrdinalIgnoreCase);
        var searchMatchesSuccess = trimmedSearch != null && "success".Contains(trimmedSearch, StringComparison.OrdinalIgnoreCase);
        var failedEvents = AuditEventTypeExtensions.FailedEvents;

        var query =
            from log in _context.AuditLogs.AsNoTracking()
            join official in _context.Officials.AsNoTracking() on log.ActorId equals official.UserId
            join citizen in _context.Citizens.AsNoTracking() on log.CitizenId equals citizen.Id into citizenJoin
            from citizen in citizenJoin.DefaultIfEmpty()
            where official.InstitutionId == institutionId
            select new { log, official, citizen };

        if (action.HasValue)
            query = query.Where(x => x.log.EventType == action.Value);

        if (dateFrom.HasValue)
            query = query.Where(x => x.log.CreatedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(x => x.log.CreatedAt <= dateTo.Value);

        if (!string.IsNullOrWhiteSpace(type))
        {
            var wantFailed = string.Equals(type, "Failed", StringComparison.OrdinalIgnoreCase);
            query = query.Where(x => failedEvents.Contains(x.log.EventType) == wantFailed);
        }

        if (trimmedSearch != null)
        {
            query = query.Where(x =>
                EF.Functions.Like(x.log.Details, $"%{trimmedSearch}%") ||
                (x.citizen != null && (EF.Functions.Like(x.citizen.Names, $"%{trimmedSearch}%") || EF.Functions.Like(x.citizen.Surname, $"%{trimmedSearch}%"))) ||
                EF.Functions.Like(x.official.Names, $"%{trimmedSearch}%") ||
                EF.Functions.Like(x.official.Surname, $"%{trimmedSearch}%") ||
                (searchMatchesFailed && failedEvents.Contains(x.log.EventType)) ||
                (searchMatchesSuccess && !failedEvents.Contains(x.log.EventType)));
        }

        var totalCount = await query.CountAsync();
        var page1Based = Math.Max(page, 1);
        var rows = await query
            .OrderByDescending(x => x.log.CreatedAt)
            .Skip((page1Based - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.log.Id,
                CreatedAt = DateTime.SpecifyKind(x.log.CreatedAt, DateTimeKind.Utc),
                x.log.EventType,
                CitizenNames = x.citizen != null ? x.citizen.Names : null,
                CitizenSurname = x.citizen != null ? x.citizen.Surname : null,
                CitizenSaId = x.citizen != null ? x.citizen.SaId : null,
                OfficialNames = x.official.Names,
                OfficialSurname = x.official.Surname,
            })
            .ToListAsync();

        var items = rows.Select(r => new OfficialHistoryItemDto
        {
            Id = r.Id,
            CreatedAt = r.CreatedAt,
            Action = r.EventType.ToString(),
            CitizenName = r.CitizenNames != null ? $"{r.CitizenNames} {r.CitizenSurname}" : null,
            CitizenIdMasked = r.CitizenSaId != null ? SaIdMasker.Mask(r.CitizenSaId) : null,
            PerformedBy = $"{r.OfficialNames} {r.OfficialSurname}",
            Outcome = AuditEventTypeExtensions.ToOutcome(r.EventType),
        }).ToList();

        return (items, totalCount);
    }

    public async Task AddAuditLogAsync(AuditLog auditLog)
    {
        await _context.AuditLogs.AddAsync(auditLog);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}