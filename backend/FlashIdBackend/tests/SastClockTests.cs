using Application.Common;

namespace tests;

public class SastClockTests
{
    [Fact]
    public void TodayUtcMidnight_AfterSastRollover_ReturnsNextCalendarDateAsUtcMidnight()
    {
        var utcNow = new DateTime(2026, 8, 17, 22, 30, 0, DateTimeKind.Utc);
        var result = SastClock.TodayUtcMidnight(utcNow);

        Assert.Equal(new DateTime(2026, 8, 18, 0, 0, 0, DateTimeKind.Utc), result);
    }

    [Fact]
    public void TodayUtcMidnight_BeforeSastRollover_ReturnsSameCalendarDateAsUtcMidnight()
    {
        var utcNow = new DateTime(2026, 8, 17, 10, 0, 0, DateTimeKind.Utc);
        var result = SastClock.TodayUtcMidnight(utcNow);

        Assert.Equal(new DateTime(2026, 8, 17, 0, 0, 0, DateTimeKind.Utc), result);
    }

    [Fact]
    public void NextMidnightUtc_ReturnsRealUtcInstantOfNextSastMidnight()
    {
        var utcNow = new DateTime(2026, 8, 17, 10, 0, 0, DateTimeKind.Utc);
        var result = SastClock.NextMidnightUtc(utcNow);

        Assert.Equal(new DateTime(2026, 8, 17, 22, 0, 0, DateTimeKind.Utc), result);
    }

    [Fact]
    public void NextMidnightUtc_CalledExactlyAtSastMidnight_ReturnsNextDaysMidnight()
    {
        var utcNow = new DateTime(2026, 8, 17, 22, 0, 0, DateTimeKind.Utc);
        var result = SastClock.NextMidnightUtc(utcNow);

        Assert.Equal(new DateTime(2026, 8, 18, 22, 0, 0, DateTimeKind.Utc), result);
    }
}