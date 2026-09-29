using Application.Features.Officials.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IOfficialActivityService
{
    Task<MyActivityResponseDto> GetMyActivityAsync(Guid userId, int? limit);

    Task<OfficialHistoryResponseDto> GetInstitutionHistoryAsync(
        Guid userId,
        string? search,
        string? action,
        DateTime? dateFrom,
        DateTime? dateTo,
        string? type,
        int? page,
        int? pageSize,
        string ipAddress
    );

    Task<OfficialHistoryActionsResponseDto> GetInstitutionActionsAsync(Guid userId);
    Task<OfficialStatsResponseDto> GetMyStatsAsync(Guid userId);
}