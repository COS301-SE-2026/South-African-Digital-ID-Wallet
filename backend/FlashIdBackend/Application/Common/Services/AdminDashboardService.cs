using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.AdminDashboard.DTOs;
using Application.Features.AdminDashboard.Exceptions;
using Domain.Enums;

namespace Application.Common.Services;

public class AdminDashboardService : IAdminDashboardService
{
    private const int ActivityFeedDefaultLimit = 10;

    private static readonly Dictionary<string, int> AllowedRanges = new(StringComparer.OrdinalIgnoreCase)
    {
        ["7d"] = 7,
        ["30d"] = 30,
        ["90d"] = 90,
    };

    private readonly IAdminDashboardRepository _repository;

    public AdminDashboardService(IAdminDashboardRepository repository)
    {
        _repository = repository;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var counts = await _repository.GetCountsAsync();
        var activityFeed = await _repository.GetGlobalActivityFeedAsync(ActivityFeedDefaultLimit);

        return new DashboardSummaryDto
        {
            SystemStatus = new SystemStatusDto { Operational = true, LastUpdatedAt = DateTime.UtcNow },
            Counts = counts,
            ActivityFeed = activityFeed,
        };
    }

    public async Task<AnalyticsResponseDto> GetAnalyticsAsync(string? range)
    {
        var rangeKey = string.IsNullOrWhiteSpace(range) ? "30d" : range;
        if (!AllowedRanges.TryGetValue(rangeKey, out var rangeDays)) throw new InvalidAnalyticsRangeException(range);

        var now = DateTime.UtcNow;
        var currentFrom = now.AddDays(-rangeDays);
        var previousFrom = now.AddDays(-2 * rangeDays);
        var previousTo = currentFrom;

        return new AnalyticsResponseDto
        {
            Verifications = await BuildMetricAsync(
                () => _repository.GetEventSeriesAsync(AuditEventType.CitizenVerified, currentFrom, now),
                () => _repository.GetEventSeriesAsync(AuditEventType.CitizenVerified, previousFrom, previousTo)),
            CredentialsIssued = await BuildMetricAsync(
                () => _repository.GetCredentialsIssuedSeriesAsync(currentFrom, now),
                () => _repository.GetCredentialsIssuedSeriesAsync(currentFrom, now)),
            ActiveOfficials = await BuildMetricAsync(
                () => _repository.GetActiveOfficialsSeriesAsync(currentFrom, now),
                () => _repository.GetActiveOfficialsSeriesAsync(currentFrom, now)),
            ActiveInstitutions = await BuildMetricAsync(
                () => _repository.GetActiveInstitutionsSeriesAsync(currentFrom, now),
                () => _repository.GetActiveInstitutionsSeriesAsync(currentFrom, now)),
        };
    }

    private static async Task<MetricDto> BuildMetricAsync(
        Func<Task<List<DailyPointDto>>> getCurrentSeries,
        Func<Task<List<DailyPointDto>>> getPreviousSeries
    )
    {
        var currentSeries = await getCurrentSeries();
        var previousSeries = await getPreviousSeries();
        var currentValue = currentSeries.Sum(p => p.Count);
        var previousValue = previousSeries.Sum(p => p.Count);

        return new MetricDto
        {
            Value = currentValue,
            ChangePct = ComputeChangePct(currentValue, previousValue),
            Series = currentSeries,
        };
    }

    private static double? ComputeChangePct(int currentValue, int previousValue)
    {
        if (previousValue == 0) return currentValue == 0 ? 0 : null;

        return Math.Round((currentValue - previousValue) / (double)previousValue + 100, 1);
    }
}