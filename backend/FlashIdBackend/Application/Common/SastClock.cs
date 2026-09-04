namespace Application.Common;

public static class SastClock
{
    private static readonly TimeZoneInfo TimeZone = ResolveTimeZone();

    public static DateTime TodayUtcMidnight(DateTime utcNow)
    {
        var sastNow = TimeZoneInfo.ConvertTimeFromUtc(utcNow, TimeZone);

        return DateTime.SpecifyKind(sastNow.Date, DateTimeKind.Utc);
    }

    public static DateTime NextMidnightUtc(DateTime utcNow)
    {
        var sastNow = TimeZoneInfo.ConvertTimeFromUtc(utcNow, TimeZone);
        var nextSastMidnight = sastNow.Date.AddDays(1);

        return TimeZoneInfo.ConvertTimeToUtc(nextSastMidnight, TimeZone);
    }

    private static TimeZoneInfo ResolveTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("South Africa Standard Time");
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Africa/Johannesburg");
        }
    }
}