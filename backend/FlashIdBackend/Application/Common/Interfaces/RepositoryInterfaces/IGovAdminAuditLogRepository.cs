using Domain.Enums;
using Application.Features.GovAdminAuditLog.DTOs;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IGovAdminAuditLogRepository
{
    Task<(List<GovAdminAuditLogItemDto> Items, int TotalCount)> GetAuditLogsAsync(
        string? search,
        AuditEventType? action,
        DateTime? dateFrom,
        DateTime? dateTo,
        int page,
        int pageSize
    );
}