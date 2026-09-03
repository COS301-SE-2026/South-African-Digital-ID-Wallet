using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Features.GovAdminAuditLog.DTOs;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class GovAdminAuditLogRepository : IGovAdminAuditLogRepository
{
    private readonly AppDbContext _context;

    public GovAdminAuditLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(List<GovAdminAuditLogItemDto> Items, int TotalCount)> GetAuditLogsAsync(
        string? search,
        AuditEventType? action,
        DateTime? dateFrom,
        DateTime? dateTo,
        int page,
        int pageSize)
    {
        var trimmedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim();

        var query =
            from log in _context.AuditLogs.AsNoTracking()
            join actor in _context.DomainUsers.AsNoTracking() on log.ActorId equals (Guid?)actor.Id into actorJoin
            from actor in actorJoin.DefaultIfEmpty()
            join credential in _context.Credentials.AsNoTracking()
                .Include(c => c.IdentityDocument)
                .Include(c => c.DriversLicense)
                 on log.CredentialId equals (Guid?)credential.Id into credentialJoin
            from credential in credentialJoin.DefaultIfEmpty()
            join citizen in _context.Citizens.AsNoTracking() on log.CitizenId equals (Guid?)citizen.Id into citizenJoin
            from citizen in citizenJoin.DefaultIfEmpty()
            select new { log, actor, credential, citizen };

        if (action.HasValue)
            query = query.Where(x => x.log.EventType == action.Value);

        if (dateFrom.HasValue)
            query = query.Where(x => x.log.CreatedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(x => x.log.CreatedAt <= dateTo.Value);

        if (trimmedSearch != null)
        {
            query = query.Where(x =>
                EF.Functions.Like(x.log.Details, $"%{trimmedSearch}%") ||
                (x.actor != null && EF.Functions.Like(x.actor.Email, $"%{trimmedSearch}%")));
        }

        var totalCount = await query.CountAsync();

        var rows = await query
            .OrderByDescending(x => x.log.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.log.Id,
                CreatedAt = DateTime.SpecifyKind(x.log.CreatedAt, DateTimeKind.Utc),
                x.log.EventType,
                x.log.Details,
                x.log.IpAddress,
                x.log.CredentialId,
                x.log.CitizenId,
                IsDriversLicense = x.credential != null && x.credential.DriversLicense != null,
                IsIdentityDocument = x.credential != null && x.credential.IdentityDocument != null,
                ActorEmail = x.actor != null ? x.actor.Email : null,
                ActorRole = x.actor != null ? x.actor.Role : (UserRole?)null,
            })
            .ToListAsync();

        var items = rows.Select(r => new GovAdminAuditLogItemDto
        {
            Id = r.Id,
            CreatedAt = r.CreatedAt,
            Action = r.EventType.ToString(),
            UserName = r.ActorEmail,
            Role = r.ActorRole?.ToString(),
            EntityType = r.CredentialId != null
                ? (r.IsDriversLicense ? "Driver's Licence" : r.IsIdentityDocument ? "ID Document" : "Credential")
                : r.CitizenId != null ? "Citizen" : null,
            IpAddress = r.IpAddress,
            Outcome = AuditEventTypeExtensions.ToOutcome(r.EventType),
            Description = r.Details,
        }).ToList();

        return (items, totalCount);
    }
}