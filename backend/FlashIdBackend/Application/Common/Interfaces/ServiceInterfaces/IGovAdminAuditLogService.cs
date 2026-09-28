using Application.Features.GovAdminAuditLog.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IGovAdminAuditLogService
{
    Task<GovAdminAuditLogResponseDto> GetAuditLogsAsync(
        string? search,
        string? action,
        DateTime? dateFrom,
        DateTime? dateTo,
        int? page,
        int? pageSize
    );
}