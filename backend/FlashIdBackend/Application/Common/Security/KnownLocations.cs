namespace Application.Common.Security;

public static class KnownLocations
{
    private static readonly Dictionary<string, (double Latitude, double Longitude)> Cities =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["Johannesburg"] = (-26.2041, 28.0473),
            ["Sandton"] = (-26.1076, 28.0567),
            ["Soweto"] = (-26.2485, 27.8540),
            ["Pretoria"] = (-25.7479, 28.2293),
            ["Centurion"] = (-25.8603, 28.1894),
            ["Cape Town"] = (-33.9249, 18.4241),
            ["Stellenbosch"] = (-33.9321, 18.8602),
            ["Durban"] = (-29.8587, 31.0218),
            ["Pietermaritzburg"] = (-29.6006, 30.3794),
            ["Gqeberha"] = (-33.9608, 25.6022),
            ["Port Elizabeth"] = (-33.9608, 25.6022),
            ["East London"] = (-33.0153, 27.9116),
            ["Bloemfontein"] = (-29.0852, 26.1596),
            ["Kimberley"] = (-28.7282, 24.7499),
            ["Polokwane"] = (-23.9045, 29.4689),
            ["Mbombela"] = (-25.4658, 30.9853),
            ["Nelspruit"] = (-25.4658, 30.9853),
            ["Rustenburg"] = (-25.6676, 27.2421),
            ["Mahikeng"] = (-25.8652, 25.6442),
            ["George"] = (-33.9630, 22.4617),
            ["Windhoek"] = (-22.5609, 17.0658),
            ["Gaborone"] = (-24.6282, 25.9231),
            ["Maputo"] = (-25.9692, 32.5732),
            ["Harare"] = (-17.8252, 31.0335),
            ["Nairobi"] = (-1.2921, 36.8219),
            ["Lagos"] = (6.5244, 3.3792),
            ["London"] = (51.5074, -0.1278),
            ["Amsterdam"] = (52.3676, 4.9041),
            ["Frankfurt"] = (50.1109, 8.6821),
            ["Paris"] = (48.8566, 2.3522),
            ["Dubai"] = (25.2048, 55.2708),
            ["Singapore"] = (1.3521, 103.8198),
            ["Sydney"] = (-33.8688, 151.2093),
            ["New York"] = (40.7128, -74.0060),
        };

    public static bool TryGetCoordinates(string? city, out double latitude, out double longitude)
    {
        latitude = 0;
        longitude = 0;

        if (string.IsNullOrWhiteSpace(city) || !Cities.TryGetValue(city.Trim(), out var coordinates))
        {
            return false;
        }

        (latitude, longitude) = coordinates;
        return true;
    }
}
