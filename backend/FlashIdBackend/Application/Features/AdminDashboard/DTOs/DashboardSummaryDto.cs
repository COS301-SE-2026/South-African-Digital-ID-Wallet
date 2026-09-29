namespace Application.Features.AdminDashboard.DTOs;

public class DashboardSummaryDto
{
    public SystemStatusDto SystemStatus { get; set; } = new();
    public DashboardCountsDto Counts { get; set; } = new();
    public List<AdminActivityItemDto> ActivityFeed { get; set; } = new();
}