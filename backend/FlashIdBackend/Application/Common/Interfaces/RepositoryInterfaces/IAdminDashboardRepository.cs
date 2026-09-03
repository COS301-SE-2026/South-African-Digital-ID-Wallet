using Application.Features.AdminDashboard.DTOs;
using Domain.Enums;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IAdminDashboardRepository
{
    Task<DashboardCountsDto> GetCountsAsync();
    Task<List<AdminActivityItemDto>> GetGlobalActivityFeedAsync(int limit);
    Task<List<DailyPointDto>> GetEventSeriesAsync(AuditEventType eventType, DateTime fromDate, DateTime toDate);
    Task<List<DailyPointDto>> GetCredentialsIssuedSeriesAsync(DateTime fromDate, DateTime toDate);
    Task<List<DailyPointDto>> GetActiveOfficialsSeriesAsync(DateTime fromDate, DateTime toDate);
    Task<List<DailyPointDto>> GetActiveInstitutionsSeriesAsync(DateTime fromDate, DateTime toDate);
}