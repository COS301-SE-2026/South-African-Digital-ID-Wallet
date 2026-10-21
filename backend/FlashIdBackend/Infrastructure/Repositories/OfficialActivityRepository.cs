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
        // EF Core can translate array.Contains into SQL IN, but not FrozenSet.Contains
        var workEvents = AuditEventTypeExtensions.OfficialWorkEvents.ToArray();
        var rows = await (
            from log in _context.AuditLogs.AsNoTracking()
            join credential in _context.Credentials.AsNoTracking() on log.CredentialId equals credential.Id into credentialJoin
            from credential in credentialJoin.DefaultIfEmpty()
                // Only citizen-facing work: logins and device checks are not "activity" an official needs to see
                // Consent is skipped here: it always comes with an onboarding, so the card would show every onboarding twice
            where log.ActorId == userId
                  && workEvents.Contains(log.EventType)
                  && log.EventType != AuditEventType.ConsentRecorded
            orderby log.CreatedAt descending
            select new
            {
                log.Id,
                log.EventType,
                log.Details,
                log.CreatedAt,
                CredentialType = credential == null ? null : credential.DriversLicense != null ? "Driver's Licence" : "Identity Document",
            })
            .Take(limit)
            .ToListAsync();

        return rows.Select(r => new MyActivityItemDto
        {
            Id = r.Id,
            EventType = r.EventType.ToString(),
            Details = r.Details,
            Summary = OfficialAuditSummaryFormatter.Format(r.EventType, r.Details, r.CredentialType),
            CreatedAt = DateTime.SpecifyKind(r.CreatedAt, DateTimeKind.Utc),
        }).ToList();
    }

    public async Task<int> CountVerificationsTodayByInstitutionAsync(
        Guid institutionId,
        DateTime fromUtc,
        DateTime toUtc)
    {
        return await (
            from auditLog in _context.AuditLogs.AsNoTracking()
            join official in _context.Officials.AsNoTracking()
                on auditLog.ActorId equals official.UserId
            where official.InstitutionId == institutionId
                  && auditLog.CreatedAt >= fromUtc
                  && auditLog.CreatedAt < toUtc
                  && (auditLog.EventType == AuditEventType.CredentialVerified
                    || auditLog.EventType == AuditEventType.OfflineCredentialVerified)
            select auditLog.Id
        ).CountAsync();
    }

    public async Task<(List<OfficialHistoryItemDto> Items, int TotalCount)> GetInstitutionHistoryAsync(
        Guid institutionId,
        string? search,
        AuditEventType? action,
        DateTime? dateFrom,
        DateTime? dateTo,
        string? type,
        int page,
        int pageSize,
        string? category = null
    )
    {
        var trimmedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim();
        var searchMatchesFailed = trimmedSearch != null && "failed".Contains(trimmedSearch, StringComparison.OrdinalIgnoreCase);
        var searchMatchesSuccess = trimmedSearch != null && "success".Contains(trimmedSearch, StringComparison.OrdinalIgnoreCase);
        var searchMatchesAccess = trimmedSearch != null && "access".Contains(trimmedSearch, StringComparison.OrdinalIgnoreCase);
        var failedEvents = AuditEventTypeExtensions.FailedEvents;
        // EF Core can translate array.Contains into SQL IN, but not FrozenSet.Contains, so copy the sets into arrays
        var hiddenCitizenEvents = AuditEventTypeExtensions.SelectiveDisclosureEvents.ToArray();
        var workEvents = AuditEventTypeExtensions.OfficialWorkEvents.ToArray();

        var query =
            from log in _context.AuditLogs.AsNoTracking()
            join official in _context.Officials.AsNoTracking() on log.ActorId equals official.UserId
            join citizen in _context.Citizens.AsNoTracking() on log.CitizenId equals citizen.Id into citizenJoin
            from citizen in citizenJoin.DefaultIfEmpty()
            join credential in _context.Credentials.AsNoTracking() on log.CredentialId equals credential.Id into credentialJoin
            from credential in credentialJoin.DefaultIfEmpty()
            where official.InstitutionId == institutionId
            select new { log, official, citizen, credential };

        query = query.Where(x => x.log.EventType != AuditEventType.AuditLogViewed);

        // "work" = citizen-facing actions, "security" = the officials' own account events, anything else = everything
        if (string.Equals(category, "work", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x => workEvents.Contains(x.log.EventType));
        }
        else if (string.Equals(category, "security", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x =>
                !workEvents.Contains(x.log.EventType) &&
                !AuditEventTypeExtensions.ViewEvents.Contains(x.log.EventType));
        }

        if (action.HasValue)
            query = query.Where(x => x.log.EventType == action.Value);

        if (dateFrom.HasValue)
            query = query.Where(x => x.log.CreatedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(x => x.log.CreatedAt <= dateTo.Value);

        if (!string.IsNullOrWhiteSpace(type))
        {
            if (string.Equals(type, "Access", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(x => AuditEventTypeExtensions.ViewEvents.Contains(x.log.EventType));
            }
            else
            {
                var wantFailed = string.Equals(type, "Failed", StringComparison.OrdinalIgnoreCase);
                query = query.Where(x =>
                    !AuditEventTypeExtensions.ViewEvents.Contains(x.log.EventType) &&
                    failedEvents.Contains(x.log.EventType) == wantFailed);
            }
        }

        if (trimmedSearch != null)
        {
            query = query.Where(x =>
                EF.Functions.Like(x.log.Details, $"%{trimmedSearch}%") ||
                // Citizen search skips verification rows, otherwise searching a name would reveal who was verified
                (x.citizen != null && !hiddenCitizenEvents.Contains(x.log.EventType) && (
                    EF.Functions.Like(x.citizen.Names, $"%{trimmedSearch}%") ||
                    EF.Functions.Like(x.citizen.Surname, $"%{trimmedSearch}%") ||
                    EF.Functions.Like(x.citizen.SaId, $"%{trimmedSearch}%"))) ||
                EF.Functions.Like(x.official.Names, $"%{trimmedSearch}%") ||
                EF.Functions.Like(x.official.Surname, $"%{trimmedSearch}%") ||
                (searchMatchesFailed && failedEvents.Contains(x.log.EventType)) ||
                (searchMatchesAccess && AuditEventTypeExtensions.ViewEvents.Contains(x.log.EventType)) ||
                (searchMatchesSuccess &&
                    !failedEvents.Contains(x.log.EventType) &&
                    !AuditEventTypeExtensions.ViewEvents.Contains(x.log.EventType)));
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
                x.log.Details,
                x.log.IpAddress,
                // Verification rows never carry the citizen's identity out of the database
                CitizenNames = x.citizen != null && !hiddenCitizenEvents.Contains(x.log.EventType) ? x.citizen.Names : null,
                CitizenSurname = x.citizen != null && !hiddenCitizenEvents.Contains(x.log.EventType) ? x.citizen.Surname : null,
                CitizenSaId = x.citizen != null && !hiddenCitizenEvents.Contains(x.log.EventType) ? x.citizen.SaId : null,
                CredentialType = x.credential == null ? null : x.credential.DriversLicense != null ? "Driver's Licence" : "Identity Document",
                OfficialNames = x.official.Names,
                OfficialSurname = x.official.Surname,
            })
            .ToListAsync();

        var items = rows.Select(r => new OfficialHistoryItemDto
        {
            Id = r.Id,
            CreatedAt = r.CreatedAt,
            Action = r.EventType.ToString(),
            Details = r.Details,
            Summary = OfficialAuditSummaryFormatter.Format(r.EventType, r.Details, r.CredentialType),
            CitizenName = r.CitizenNames != null ? $"{r.CitizenNames} {r.CitizenSurname}" : null,
            CitizenSaId = r.CitizenSaId,
            PerformedBy = $"{r.OfficialNames} {r.OfficialSurname}",
            Outcome = AuditEventTypeExtensions.ToOutcome(r.EventType),
            IpAddress = r.IpAddress,
        }).ToList();

        return (items, totalCount);
    }

    public async Task<List<string>> GetInstitutionActionsAsync(Guid institutionId)
    {
        var eventTypes = await (
            from log in _context.AuditLogs.AsNoTracking()
            join official in _context.Officials.AsNoTracking() on log.ActorId equals official.UserId
            where official.InstitutionId == institutionId
                  && !AuditEventTypeExtensions.ViewEvents.Contains(log.EventType)
            select log.EventType
        ).Distinct().ToListAsync();

        return eventTypes
            .Select(eventType => eventType.ToString())
            .OrderBy(name => name)
            .ToList();
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
