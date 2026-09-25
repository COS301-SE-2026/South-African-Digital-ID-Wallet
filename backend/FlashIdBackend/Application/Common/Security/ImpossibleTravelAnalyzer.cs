using Application.Features.FraudDetection;

namespace Application.Common.Security;

public sealed record TravelAnalysis(
    double DistanceKm,
    double ElapsedMinutes,
    double ImpliedSpeedKmh,
    bool IsSignificantDistance,
    bool IsImpossible);

public static class ImpossibleTravelAnalyzer
{
    private static readonly TimeSpan MinimumElapsed = TimeSpan.FromSeconds(1);

    public static TravelAnalysis Analyze(
        double fromLatitude, double fromLongitude, DateTime fromTime,
        double toLatitude, double toLongitude, DateTime toTime,
        FraudDetectionOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        var distanceKm = GeoDistance.HaversineKm(fromLatitude, fromLongitude, toLatitude, toLongitude);

        var elapsed = (toTime - fromTime).Duration();
        var effectiveElapsed = elapsed < MinimumElapsed ? MinimumElapsed : elapsed;
        var speedKmh = distanceKm / effectiveElapsed.TotalHours;

        var isSignificant = distanceKm >= options.MinimumDistanceKm;

        return new TravelAnalysis(
            Math.Round(distanceKm, 1),
            Math.Round(elapsed.TotalMinutes, 1),
            Math.Round(speedKmh, 1),
            isSignificant,
            isSignificant && speedKmh > options.MaxPlausibleSpeedKmh);
    }
}
