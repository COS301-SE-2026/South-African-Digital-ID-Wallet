using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Officials.DTOs;
using Domain.Enums;
using Domain.Entities;

namespace Application.Common.Services;

public class OfficialActivityService : IOfficialActivityService
{
    private const int DefaultActivityLimit = 5;
    private const int MinActivityLimit = 1;
    private const int MaxActivityLimit = 20;

    private const int DefaultPageSize = 7;
    private const int MinPageSize = 1;
    private const int MaxPageSize = 100;

    private readonly IOfficialActivityRepository _officialActivityRepository;
    private readonly IOfficialRepository _officialRepository;

    public OfficialActivityService(IOfficialActivityRepository officialActivityRepository, IOfficialRepository officialRepository)
    {
        _officialActivityRepository = officialActivityRepository;
        _officialRepository = officialRepository;
    }

    public async Task<MyActivityResponseDto> GetMyActivityAsync(Guid userId, int? limit)
    {
        var clampedLimit = Math.Clamp(limit ?? DefaultActivityLimit, MinActivityLimit, MaxActivityLimit);
        var items = await _officialActivityRepository.GetRecentByActorAsync(userId, clampedLimit);

        return new MyActivityResponseDto { Items = items };
    }

    public async Task<OfficialHistoryResponseDto> GetInstitutionHistoryAsync(
        Guid userId,
        string? search,
        string? action,
        DateTime? dateFrom,
        DateTime? dateTo,
        string? type,
        int? page,
        int? pageSize,
        string ipAddress
    )
    {
        var official = await _officialRepository.GetByUserIdAsync(userId) ?? throw new UnauthorizedAccessException("The authenticated official could not be identified.");
        var clampedPage = Math.Max(page ?? 1, 1);
        var clampedPageSize = Math.Clamp(pageSize ?? DefaultPageSize, MinPageSize, MaxPageSize);
        var parsedAction = Enum.TryParse<AuditEventType>(action, ignoreCase: true, out var actionValue) ? actionValue : (AuditEventType?)null;
        var (items, totalCount) = await _officialActivityRepository.GetInstitutionHistoryAsync(official.InstitutionId, search, parsedAction, dateFrom, dateTo, type, clampedPage, clampedPageSize);

        await _officialActivityRepository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.AuditLogViewed,
            ActorId = userId,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow,
            Details = $"Viewed institution audit history: search='{search}', action='{action}', dateFrom='{dateFrom:O}', dateTo='{dateTo:O}', type='{type}', page='{clampedPage}', pageSize='{clampedPageSize}'; resultCount={items.Count}",
        });

        await _officialActivityRepository.SaveChangesAsync();

        return new OfficialHistoryResponseDto
        {
            Items = items,
            Page = clampedPage,
            PageSize = clampedPageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<OfficialHistoryActionsResponseDto> GetInstitutionActionsAsync(Guid userId)
    {
        var official = await _officialRepository.GetByUserIdAsync(userId)
            ?? throw new UnauthorizedAccessException("The authenticated official could not be identified.");

        var actions = await _officialActivityRepository.GetInstitutionActionsAsync(official.InstitutionId);

        return new OfficialHistoryActionsResponseDto { Actions = actions };
    }

    public async Task<OfficialStatsResponseDto> GetMyStatsAsync(Guid userId)
    {
        var official = await _officialRepository.GetByUserIdAsync(userId)
            ?? throw new UnauthorizedAccessException(
                "The authenticated official could not be identified.");

        var startOfTodayUtc = DateTime.UtcNow.Date;
        var startOfTomorrowUtc = startOfTodayUtc.AddDays(1);

        var todayCount =
            await _officialActivityRepository.CountVerificationsTodayByInstitutionAsync(
                official.InstitutionId,
                startOfTodayUtc,
                startOfTomorrowUtc);

        return new OfficialStatsResponseDto
        {
            TodayCount = todayCount,
            IsCapped = false,
        };
    }
}