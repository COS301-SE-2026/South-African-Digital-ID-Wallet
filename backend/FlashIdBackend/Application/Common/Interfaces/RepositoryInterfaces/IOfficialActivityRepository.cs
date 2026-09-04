using Domain.Entities;
using Domain.Enums;
using Application.Features.Officials.DTOs;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IOfficialActivityRepository
{
    Task<List<MyActivityItemDto>> GetRecentByActorAsync(Guid userId, int limit);

    Task<(List<OfficialHistoryItemDto> Items, int TotalCount)> GetInstitutionHistoryAsync(
        Guid institutionId,
        string? search,
        AuditEventType? action,
        DateTime? dateFrom,
        DateTime? dateTo,
        string? type,
        int page,
        int pageSize
    );

    Task<int> CountVerificationsTodayByInstitutionAsync(
        Guid institutionId,
        DateTime fromUtc,
        DateTime toUtc
    );

    Task<List<string>> GetInstitutionActionsAsync(Guid institutionId);
    Task AddAuditLogAsync(AuditLog auditLog);
    Task SaveChangesAsync();
}