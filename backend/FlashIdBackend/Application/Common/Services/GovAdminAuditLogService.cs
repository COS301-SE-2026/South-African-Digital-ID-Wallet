using Application.Features.GovAdminAuditLog.Exceptions;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.GovAdminAuditLog.DTOs;
using Domain.Enums;

namespace Application.Common.Services;

public class GovAdminAuditLogService : IGovAdminAuditLogService
{
    private const int DefaultPageSize = 10;
    private const int MinPageSize = 1;
    private const int MaxPageSize = 100;

    private readonly IGovAdminAuditLogRepository _repository;

    public GovAdminAuditLogService(IGovAdminAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<GovAdminAuditLogResponseDto> GetAuditLogsAsync(
        string? search,
        string? action,
        DateTime? dateFrom,
        DateTime? dateTo,
        int? page,
        int? pageSize)
    {
        var clampedPage = Math.Max(page ?? 1, 1);
        var clampedPageSize = Math.Clamp(pageSize ?? DefaultPageSize, MinPageSize, MaxPageSize);
        AuditEventType? parsedAction = null;
        if (!string.IsNullOrWhiteSpace(action))
        {
            if (!Enum.TryParse<AuditEventType>(action, ignoreCase: true, out var actionValue)
                || !Enum.IsDefined(actionValue))
            {
                throw new InvalidAuditActionException(action);
            }

            parsedAction = actionValue;
        }

        var (items, totalCount) = await _repository.GetAuditLogsAsync(
            search, parsedAction, dateFrom, dateTo, clampedPage, clampedPageSize);

        return new GovAdminAuditLogResponseDto
        {
            Items = items,
            Page = clampedPage,
            PageSize = clampedPageSize,
            TotalCount = totalCount,
        };
    }
}