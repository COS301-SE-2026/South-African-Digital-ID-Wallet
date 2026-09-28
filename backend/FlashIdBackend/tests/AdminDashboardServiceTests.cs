using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.AdminDashboard.DTOs;
using Application.Features.AdminDashboard.Exceptions;
using Domain.Enums;

namespace tests;

public class AdminDashboardServiceTests
{
    private sealed class SeriesStub
    {
        public List<DailyPointDto> Current = new();
        public List<DailyPointDto> Previous = new();
        public readonly List<(DateTime From, DateTime To)> Windows = new();

        public Task<List<DailyPointDto>> Next(DateTime from, DateTime to)
        {
            Windows.Add((from, to));
            return Task.FromResult(Windows.Count == 1 ? Current : Previous);
        }
    }

    private sealed class FakeAdminDashboardRepository : IAdminDashboardRepository
    {
        public DashboardCountsDto Counts = new();
        public List<AdminActivityItemDto> ActivityFeed = new();
        public int ActivityFeedLimit = -1;
        public int CountsCalls;

        public readonly SeriesStub Events = new();
        public readonly SeriesStub CredentialsIssued = new();
        public readonly SeriesStub ActiveOfficials = new();
        public readonly SeriesStub ActiveInstitutions = new();
        public readonly List<AuditEventType> RequestedEventTypes = new();

        public Task<DashboardCountsDto> GetCountsAsync()
        {
            CountsCalls++;
            return Task.FromResult(Counts);
        }

        public Task<List<AdminActivityItemDto>> GetGlobalActivityFeedAsync(int limit)
        {
            ActivityFeedLimit = limit;
            return Task.FromResult(ActivityFeed);
        }

        public Task<List<DailyPointDto>> GetEventSeriesAsync(AuditEventType eventType, DateTime fromDate, DateTime toDate)
        {
            RequestedEventTypes.Add(eventType);
            return Events.Next(fromDate, toDate);
        }

        public Task<List<DailyPointDto>> GetCredentialsIssuedSeriesAsync(DateTime fromDate, DateTime toDate) =>
            CredentialsIssued.Next(fromDate, toDate);

        public Task<List<DailyPointDto>> GetActiveOfficialsSeriesAsync(DateTime fromDate, DateTime toDate) =>
            ActiveOfficials.Next(fromDate, toDate);

        public Task<List<DailyPointDto>> GetActiveInstitutionsSeriesAsync(DateTime fromDate, DateTime toDate) =>
            ActiveInstitutions.Next(fromDate, toDate);
    }

    private sealed class Ctx
    {
        public FakeAdminDashboardRepository Repo = null!;
        public AdminDashboardService Service = null!;
    }

    private static Ctx Setup()
    {
        var repo = new FakeAdminDashboardRepository();

        return new Ctx { Repo = repo, Service = new AdminDashboardService(repo) };
    }

    private static List<DailyPointDto> Series(params int[] counts)
    {
        var start = new DateOnly(2026, 9, 1);

        return counts
            .Select((count, index) => new DailyPointDto { Date = start.AddDays(index), Count = count })
            .ToList();
    }

    [Fact]
    public async Task GetSummaryAsync_ReturnsSystemAsOperationalWithCurrentTimestamp()
    {
        var c = Setup();
        var before = DateTime.UtcNow;

        var result = await c.Service.GetSummaryAsync();

        Assert.True(result.SystemStatus.Operational);
        Assert.InRange(result.SystemStatus.LastUpdatedAt, before, DateTime.UtcNow);
    }

    [Fact]
    public async Task GetSummaryAsync_RequestsTenMostRecentActivityItems()
    {
        var c = Setup();

        await c.Service.GetSummaryAsync();

        Assert.Equal(10, c.Repo.ActivityFeedLimit);
    }

    [Fact]
    public async Task GetSummaryAsync_PassesRepositoryCountsAndFeedStraightThrough()
    {
        var c = Setup();
        c.Repo.Counts = new DashboardCountsDto { Users = 42, Institutions = 7, CredentialsIssued = 130 };
        c.Repo.ActivityFeed = new List<AdminActivityItemDto>
        {
            new() { Id = Guid.NewGuid(), EventType = nameof(AuditEventType.UserRegistered), Details = "A citizen registered", CreatedAt = DateTime.UtcNow },
        };

        var result = await c.Service.GetSummaryAsync();

        Assert.Equal(42, result.Counts.Users);
        Assert.Equal(7, result.Counts.Institutions);
        Assert.Equal(130, result.Counts.CredentialsIssued);
        Assert.Single(result.ActivityFeed);
        Assert.Equal(1, c.Repo.CountsCalls);
    }

    [Fact]
    public async Task GetAnalyticsAsync_WithNullRange_DefaultsToThirtyDays()
    {
        var c = Setup();

        await c.Service.GetAnalyticsAsync(null);

        var (from, to) = c.Repo.Events.Windows[0];
        Assert.Equal(30, (to - from).TotalDays, 3);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GetAnalyticsAsync_WithBlankRange_DefaultsToThirtyDays(string range)
    {
        var c = Setup();

        await c.Service.GetAnalyticsAsync(range);

        var (from, to) = c.Repo.Events.Windows[0];
        Assert.Equal(30, (to - from).TotalDays, 3);
    }

    [Theory]
    [InlineData("7d", 7)]
    [InlineData("30d", 30)]
    [InlineData("90d", 90)]
    [InlineData("7D", 7)]
    [InlineData("90D", 90)]
    public async Task GetAnalyticsAsync_WithAllowedRange_QueriesThatManyDaysCaseInsensitively(string range, int expectedDays)
    {
        var c = Setup();

        await c.Service.GetAnalyticsAsync(range);

        var (from, to) = c.Repo.Events.Windows[0];
        Assert.Equal(expectedDays, (to - from).TotalDays, 3);
    }

    [Theory]
    [InlineData("1d")]
    [InlineData("60d")]
    [InlineData("7days")]
    [InlineData("d7")]
    public async Task GetAnalyticsAsync_WithUnsupportedRange_ThrowsInvalidAnalyticsRangeException(string range)
    {
        var c = Setup();

        var ex = await Assert.ThrowsAsync<InvalidAnalyticsRangeException>(
            () => c.Service.GetAnalyticsAsync(range));

        Assert.Contains(range, ex.Message);
        Assert.Empty(c.Repo.Events.Windows);
    }

    [Fact]
    public async Task GetAnalyticsAsync_PreviousWindowEndsExactlyWhereCurrentWindowBegins()
    {
        var c = Setup();

        await c.Service.GetAnalyticsAsync("7d");

        var current = c.Repo.Events.Windows[0];
        var previous = c.Repo.Events.Windows[1];

        Assert.Equal(current.From, previous.To);
        Assert.Equal(7, (previous.To - previous.From).TotalDays, 3);
    }

    [Fact]
    public async Task GetAnalyticsAsync_SumsCurrentSeriesIntoMetricValue()
    {
        var c = Setup();
        c.Repo.Events.Current = Series(3, 4, 5);
        c.Repo.Events.Previous = Series(1, 1);

        var result = await c.Service.GetAnalyticsAsync("7d");

        Assert.Equal(12, result.Verifications.Value);
        Assert.Equal(3, result.Verifications.Series.Count);
    }

    [Fact]
    public async Task GetAnalyticsAsync_WhenBothPeriodsAreZero_ReportsZeroChange()
    {
        var c = Setup();

        var result = await c.Service.GetAnalyticsAsync("7d");

        Assert.Equal(0, result.Verifications.Value);
        Assert.Equal(0d, result.Verifications.ChangePct);
    }

    [Fact]
    public async Task GetAnalyticsAsync_WhenPreviousPeriodWasZeroAndCurrentIsNot_ReportsNullChange()
    {
        var c = Setup();
        c.Repo.Events.Current = Series(5);

        var result = await c.Service.GetAnalyticsAsync("7d");

        Assert.Equal(5, result.Verifications.Value);
        Assert.Null(result.Verifications.ChangePct);
    }

    [Fact]
    public async Task GetAnalyticsAsync_WhenActivityIncreased_ReportsPositiveChange()
    {
        var c = Setup();
        c.Repo.Events.Current = Series(150);
        c.Repo.Events.Previous = Series(100);

        var result = await c.Service.GetAnalyticsAsync("7d");

        Assert.Equal(50d, result.Verifications.ChangePct);
    }

    [Fact]
    public async Task GetAnalyticsAsync_WhenActivityDecreased_ReportsNegativeChange()
    {
        var c = Setup();
        c.Repo.Events.Current = Series(50);
        c.Repo.Events.Previous = Series(100);

        var result = await c.Service.GetAnalyticsAsync("7d");

        Assert.Equal(-50d, result.Verifications.ChangePct);
    }

    [Fact]
    public async Task GetAnalyticsAsync_WithRecurringChangePct_RoundsToOneDecimalPlace()
    {
        var c = Setup();
        c.Repo.Events.Current = Series(7);
        c.Repo.Events.Previous = Series(3);

        var result = await c.Service.GetAnalyticsAsync("7d");

        Assert.Equal(133.3d, result.Verifications.ChangePct);
    }

    [Fact]
    public async Task GetAnalyticsAsync_QueriesTheCredentialVerifiedEventTypeForBothWindows()
    {
        var c = Setup();

        await c.Service.GetAnalyticsAsync("7d");

        Assert.Equal(2, c.Repo.RequestedEventTypes.Count);
        Assert.All(c.Repo.RequestedEventTypes, t => Assert.Equal(AuditEventType.CredentialVerified, t));
    }

    [Fact]
    public async Task GetAnalyticsAsync_MapsEachRepositorySeriesToItsOwnMetric()
    {
        var c = Setup();
        c.Repo.Events.Current = Series(1);
        c.Repo.CredentialsIssued.Current = Series(2);
        c.Repo.ActiveOfficials.Current = Series(3);
        c.Repo.ActiveInstitutions.Current = Series(4);

        var result = await c.Service.GetAnalyticsAsync("30d");

        Assert.Equal(1, result.Verifications.Value);
        Assert.Equal(2, result.CredentialsIssued.Value);
        Assert.Equal(3, result.ActiveOfficials.Value);
        Assert.Equal(4, result.ActiveInstitutions.Value);
    }

    [Fact]
    public async Task GetAnalyticsAsync_QueriesEveryMetricForBothWindows()
    {
        var c = Setup();

        await c.Service.GetAnalyticsAsync("30d");

        Assert.Equal(2, c.Repo.Events.Windows.Count);
        Assert.Equal(2, c.Repo.CredentialsIssued.Windows.Count);
        Assert.Equal(2, c.Repo.ActiveOfficials.Windows.Count);
        Assert.Equal(2, c.Repo.ActiveInstitutions.Windows.Count);
    }
}
