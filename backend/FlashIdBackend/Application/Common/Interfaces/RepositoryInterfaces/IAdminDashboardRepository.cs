using Application.Features.AdminDashboard.DTOs;
using Domain.Enums;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IAdminDashboardRepository
{
    Task<DashboardCountsDto> GetCountsAsync();
    Task<List<AdminActivityItemDto>> GetGlobalActivityFeedAsync(int limit);
    Task<List<DailyPointDto>> GetEventSeriesAsync(AuditEventType eventType, DateTime from, DateTime to);
    Task<List<DailyPointDto>> GetCredentialsIssuedSeriesAsync(DateTime from, DateTime to);
    Task<List<DailyPointDto>> GetActiveOfficialsSeriesAsync(DateTime from, DateTime to);
    Task<List<DailyPointDto>> GetActiveInstitutionsSeriesAsync(DateTime from, DateTime to);
}