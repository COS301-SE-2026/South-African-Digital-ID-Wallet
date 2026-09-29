using Application.Features.AdminDashboard.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IAdminDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
    Task<AnalyticsResponseDto> GetAnalyticsAsync(string? range);
}