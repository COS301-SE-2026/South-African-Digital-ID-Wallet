using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.Officials.DTOs;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class OfficialActivityServiceTests
{
    private const string TestIpAddress = "192.168.1.10"; // NOSONAR - test-only dummy value, not a real secret

    private sealed class HistoryQuery
    {
        public Guid InstitutionId;
        public string? Search;
        public AuditEventType? Action;
        public DateTime? DateFrom;
        public DateTime? DateTo;
        public string? Type;
        public int Page;
        public int PageSize;
    }

    private sealed class FakeOfficialRepository : IOfficialRepository
    {
        public Official? OfficialToReturn;
        public Guid? RequestedUserId;

        public Task<Official?> GetByUserIdAsync(Guid userId)
        {
            RequestedUserId = userId;
            return Task.FromResult(OfficialToReturn);
        }

        public Task<Official?> GetByIdAsync(Guid id) => Task.FromResult(OfficialToReturn);
    }

    private sealed class FakeOfficialActivityRepository : IOfficialActivityRepository
    {
        public List<MyActivityItemDto> RecentActivity = new();
        public Guid? RecentActorId;
        public int? RecentLimit;

        public List<OfficialHistoryItemDto> HistoryItems = new();
        public int HistoryTotalCount;
        public HistoryQuery? LastHistoryQuery;

        public List<string> InstitutionActions = new();
        public Guid? ActionsInstitutionId;

        public int VerificationsToday;
        public Guid? CountInstitutionId;
        public DateTime CountFromUtc;
        public DateTime CountToUtc;

        public List<AuditLog> AuditLogs = new();
        public int Saves;

        public Task<List<MyActivityItemDto>> GetRecentByActorAsync(Guid userId, int limit)
        {
            RecentActorId = userId;
            RecentLimit = limit;
            return Task.FromResult(RecentActivity);
        }

        public Task<(List<OfficialHistoryItemDto> Items, int TotalCount)> GetInstitutionHistoryAsync(
            Guid institutionId,
            string? search,
            AuditEventType? action,
            DateTime? dateFrom,
            DateTime? dateTo,
            string? type,
            int page,
            int pageSize)
        {
            LastHistoryQuery = new HistoryQuery
            {
                InstitutionId = institutionId,
                Search = search,
                Action = action,
                DateFrom = dateFrom,
                DateTo = dateTo,
                Type = type,
                Page = page,
                PageSize = pageSize,
            };

            return Task.FromResult((HistoryItems, HistoryTotalCount));
        }

        public Task<int> CountVerificationsTodayByInstitutionAsync(Guid institutionId, DateTime fromUtc, DateTime toUtc)
        {
            CountInstitutionId = institutionId;
            CountFromUtc = fromUtc;
            CountToUtc = toUtc;
            return Task.FromResult(VerificationsToday);
        }

        public Task<List<string>> GetInstitutionActionsAsync(Guid institutionId)
        {
            ActionsInstitutionId = institutionId;
            return Task.FromResult(InstitutionActions);
        }

        public Task AddAuditLogAsync(AuditLog auditLog)
        {
            AuditLogs.Add(auditLog);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync()
        {
            Saves++;
            return Task.CompletedTask;
        }
    }

    private sealed class Ctx
    {
        public FakeOfficialActivityRepository ActivityRepo = null!;
        public FakeOfficialRepository OfficialRepo = null!;
        public OfficialActivityService Service = null!;
        public Guid InstitutionId;
        public Guid UserId;
    }

    private static Ctx Setup(bool officialExists = true)
    {
        var userId = Guid.NewGuid();
        var institutionId = Guid.NewGuid();

        var officialRepo = new FakeOfficialRepository
        {
            OfficialToReturn = officialExists
                ? new Official { Id = Guid.NewGuid(), UserId = userId, InstitutionId = institutionId }
                : null,
        };

        var activityRepo = new FakeOfficialActivityRepository();

        return new Ctx
        {
            ActivityRepo = activityRepo,
            OfficialRepo = officialRepo,
            Service = new OfficialActivityService(activityRepo, officialRepo),
            InstitutionId = institutionId,
            UserId = userId,
        };
    }

    private static MyActivityItemDto ActivityItem() => new()
    {
        Id = Guid.NewGuid(),
        EventType = nameof(AuditEventType.CredentialVerified),
        Details = "Verified a credential",
        CreatedAt = DateTime.UtcNow,
    };

    private static OfficialHistoryItemDto HistoryItem() => new()
    {
        Id = Guid.NewGuid(),
        CreatedAt = DateTime.UtcNow,
        Action = nameof(AuditEventType.CredentialVerified),
        Details = "Verified a credential",
        PerformedBy = "Test Official",
        Outcome = "Success",
    };

    [Theory]
    [InlineData(null, 5)]
    [InlineData(0, 1)]
    [InlineData(-3, 1)]
    [InlineData(1, 1)]
    [InlineData(7, 7)]
    [InlineData(20, 20)]
    [InlineData(21, 20)]
    [InlineData(500, 20)]
    public async Task GetMyActivityAsync_ClampsLimitBetweenOneAndTwenty(int? limit, int expected)
    {
        var c = Setup();

        await c.Service.GetMyActivityAsync(c.UserId, limit);

        Assert.Equal(expected, c.ActivityRepo.RecentLimit);
    }

    [Fact]
    public async Task GetMyActivityAsync_QueriesActivityForTheCallingUser()
    {
        var c = Setup();

        await c.Service.GetMyActivityAsync(c.UserId, null);

        Assert.Equal(c.UserId, c.ActivityRepo.RecentActorId);
    }

    [Fact]
    public async Task GetMyActivityAsync_ReturnsItemsFromRepository()
    {
        var c = Setup();
        c.ActivityRepo.RecentActivity = new List<MyActivityItemDto> { ActivityItem(), ActivityItem() };

        var result = await c.Service.GetMyActivityAsync(c.UserId, null);

        Assert.Equal(2, result.Items.Count);
    }

    [Fact]
    public async Task GetMyActivityAsync_WithNoMatchingOfficialRecord_StillReturnsActivity()
    {
        var c = Setup(officialExists: false);

        var result = await c.Service.GetMyActivityAsync(c.UserId, null);

        Assert.Empty(result.Items);
        Assert.Null(c.OfficialRepo.RequestedUserId);
    }

    [Fact]
    public async Task GetInstitutionHistoryAsync_WhenOfficialNotFound_ThrowsUnauthorizedAccess()
    {
        var c = Setup(officialExists: false);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => c.Service.GetInstitutionHistoryAsync(c.UserId, null, null, null, null, null, null, null, TestIpAddress));
    }

    [Fact]
    public async Task GetInstitutionHistoryAsync_WhenOfficialNotFound_QueriesNothingAndWritesNoAuditLog()
    {
        var c = Setup(officialExists: false);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => c.Service.GetInstitutionHistoryAsync(c.UserId, null, null, null, null, null, null, null, TestIpAddress));

        Assert.Null(c.ActivityRepo.LastHistoryQuery);
        Assert.Empty(c.ActivityRepo.AuditLogs);
        Assert.Equal(0, c.ActivityRepo.Saves);
    }

    [Theory]
    [InlineData(null, 1)]
    [InlineData(0, 1)]
    [InlineData(-5, 1)]
    [InlineData(1, 1)]
    [InlineData(3, 3)]
    public async Task GetInstitutionHistoryAsync_ClampsPageToAtLeastOne(int? page, int expected)
    {
        var c = Setup();

        var result = await c.Service.GetInstitutionHistoryAsync(
            c.UserId, null, null, null, null, null, page, null, TestIpAddress);

        Assert.Equal(expected, c.ActivityRepo.LastHistoryQuery!.Page);
        Assert.Equal(expected, result.Page);
    }

    [Theory]
    [InlineData(null, 7)]
    [InlineData(0, 1)]
    [InlineData(-1, 1)]
    [InlineData(1, 1)]
    [InlineData(50, 50)]
    [InlineData(100, 100)]
    [InlineData(101, 100)]
    [InlineData(5000, 100)]
    public async Task GetInstitutionHistoryAsync_ClampsPageSizeBetweenOneAndOneHundred(int? pageSize, int expected)
    {
        var c = Setup();

        var result = await c.Service.GetInstitutionHistoryAsync(
            c.UserId, null, null, null, null, null, null, pageSize, TestIpAddress);

        Assert.Equal(expected, c.ActivityRepo.LastHistoryQuery!.PageSize);
        Assert.Equal(expected, result.PageSize);
    }

    [Theory]
    [InlineData(null, null)]
    [InlineData("", null)]
    [InlineData("   ", null)]
    [InlineData("notarealaction", null)]
    [InlineData("CredentialVerified", AuditEventType.CredentialVerified)]
    [InlineData("credentialverified", AuditEventType.CredentialVerified)]
    [InlineData("CREDENTIALVERIFIED", AuditEventType.CredentialVerified)]
    public async Task GetInstitutionHistoryAsync_ParsesActionCaseInsensitivelyAndIgnoresUnknownValues(
        string? action,
        AuditEventType? expected)
    {
        var c = Setup();

        await c.Service.GetInstitutionHistoryAsync(
            c.UserId, null, action, null, null, null, null, null, TestIpAddress);

        Assert.Equal(expected, c.ActivityRepo.LastHistoryQuery!.Action);
    }

    [Fact]
    public async Task GetInstitutionHistoryAsync_ScopesQueryToTheOfficialsInstitution()
    {
        var c = Setup();

        await c.Service.GetInstitutionHistoryAsync(
            c.UserId, null, null, null, null, null, null, null, TestIpAddress);

        Assert.Equal(c.InstitutionId, c.ActivityRepo.LastHistoryQuery!.InstitutionId);
        Assert.Equal(c.UserId, c.OfficialRepo.RequestedUserId);
    }

    [Fact]
    public async Task GetInstitutionHistoryAsync_PassesFiltersThroughUnchanged()
    {
        var c = Setup();
        var from = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc);
        var to = new DateTime(2026, 8, 31, 0, 0, 0, DateTimeKind.Utc);

        await c.Service.GetInstitutionHistoryAsync(
            c.UserId, "Dlamini", null, from, to, "Verification", null, null, TestIpAddress);

        var query = c.ActivityRepo.LastHistoryQuery!;
        Assert.Equal("Dlamini", query.Search);
        Assert.Equal(from, query.DateFrom);
        Assert.Equal(to, query.DateTo);
        Assert.Equal("Verification", query.Type);
    }

    [Fact]
    public async Task GetInstitutionHistoryAsync_WritesAuditLogViewedEntryForTheCaller()
    {
        var c = Setup();
        c.ActivityRepo.HistoryItems = new List<OfficialHistoryItemDto> { HistoryItem(), HistoryItem() };
        var before = DateTime.UtcNow;

        await c.Service.GetInstitutionHistoryAsync(
            c.UserId, null, null, null, null, null, null, null, TestIpAddress);

        var log = Assert.Single(c.ActivityRepo.AuditLogs);
        Assert.Equal(AuditEventType.AuditLogViewed, log.EventType);
        Assert.Equal(c.UserId, log.ActorId);
        Assert.Equal(TestIpAddress, log.IpAddress);
        Assert.InRange(log.CreatedAt, before, DateTime.UtcNow);
        Assert.Contains("resultCount=2", log.Details);
        Assert.Equal(1, c.ActivityRepo.Saves);
    }

    [Fact]
    public async Task GetInstitutionHistoryAsync_RecordsClampedPagingValuesInTheAuditLog()
    {
        var c = Setup();

        await c.Service.GetInstitutionHistoryAsync(
            c.UserId, null, null, null, null, null, -4, 900, TestIpAddress);

        var log = Assert.Single(c.ActivityRepo.AuditLogs);
        Assert.Contains("page='1'", log.Details);
        Assert.Contains("pageSize='100'", log.Details);
    }

    [Fact]
    public async Task GetInstitutionHistoryAsync_ReturnsItemsAndTotalCountFromRepository()
    {
        var c = Setup();
        c.ActivityRepo.HistoryItems = new List<OfficialHistoryItemDto> { HistoryItem() };
        c.ActivityRepo.HistoryTotalCount = 137;

        var result = await c.Service.GetInstitutionHistoryAsync(
            c.UserId, null, null, null, null, null, 2, 25, TestIpAddress);

        Assert.Single(result.Items);
        Assert.Equal(137, result.TotalCount);
        Assert.Equal(2, result.Page);
        Assert.Equal(25, result.PageSize);
    }

    [Fact]
    public async Task GetInstitutionActionsAsync_WhenOfficialNotFound_ThrowsUnauthorizedAccess()
    {
        var c = Setup(officialExists: false);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => c.Service.GetInstitutionActionsAsync(c.UserId));
    }

    [Fact]
    public async Task GetInstitutionActionsAsync_ReturnsActionsForTheOfficialsInstitution()
    {
        var c = Setup();
        c.ActivityRepo.InstitutionActions = new List<string>
        {
            nameof(AuditEventType.CredentialVerified),
            nameof(AuditEventType.OnboardCitizen),
        };

        var result = await c.Service.GetInstitutionActionsAsync(c.UserId);

        Assert.Equal(2, result.Actions.Count);
        Assert.Equal(c.InstitutionId, c.ActivityRepo.ActionsInstitutionId);
    }

    [Fact]
    public async Task GetMyStatsAsync_WhenOfficialNotFound_ThrowsUnauthorizedAccess()
    {
        var c = Setup(officialExists: false);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => c.Service.GetMyStatsAsync(c.UserId));
    }

    [Fact]
    public async Task GetMyStatsAsync_CountsAcrossTodaysUtcDayForTheOfficialsInstitution()
    {
        var c = Setup();
        c.ActivityRepo.VerificationsToday = 12;

        var result = await c.Service.GetMyStatsAsync(c.UserId);

        Assert.Equal(12, result.TodayCount);
        Assert.Equal(c.InstitutionId, c.ActivityRepo.CountInstitutionId);
        Assert.Equal(TimeSpan.Zero, c.ActivityRepo.CountFromUtc.TimeOfDay);
        Assert.Equal(1, (c.ActivityRepo.CountToUtc - c.ActivityRepo.CountFromUtc).TotalDays);
    }

    [Fact]
    public async Task GetMyStatsAsync_NeverReportsTheCountAsCapped()
    {
        var c = Setup();
        c.ActivityRepo.VerificationsToday = 100000;

        var result = await c.Service.GetMyStatsAsync(c.UserId);

        Assert.False(result.IsCapped);
    }
}