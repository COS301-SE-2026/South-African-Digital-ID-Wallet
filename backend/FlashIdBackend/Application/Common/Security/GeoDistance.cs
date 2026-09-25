namespace Application.Common.Security;

public static class GeoDistance
{
    public const double EarthRadiusKm = 6371.0088;

    public static double HaversineKm(double latitude1, double longitude1, double latitude2, double longitude2)
    {
        EnsureValid(latitude1, longitude1);
        EnsureValid(latitude2, longitude2);

        var dLat = ToRadians(latitude2 - latitude1);
        var dLon = ToRadians(longitude2 - longitude1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(latitude1)) * Math.Cos(ToRadians(latitude2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return EarthRadiusKm * c;
    }

    public static bool IsValidCoordinate(double? latitude, double? longitude) =>
        latitude is >= -90 and <= 90 && longitude is >= -180 and <= 180;

    private static void EnsureValid(double latitude, double longitude)
    {
        if (!IsValidCoordinate(latitude, longitude))
        {
            throw new ArgumentOutOfRangeException(nameof(latitude),
                "Latitude must be between -90 and 90 and longitude between -180 and 180.");
        }
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180d;
}
