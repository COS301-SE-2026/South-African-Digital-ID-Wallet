using System.Globalization;

namespace Application.Common.Security;

public sealed record FraudSignal(string Code, int Weight);

public static class FraudSignals
{
    public const string ImpossibleTravel = "ImpossibleTravel";
    public const string LocationChange = "LocationChange";
    public const string CountryChange = "CountryChange";
    public const string NewDevice = "NewDevice";
    public const string UntrustedDevice = "UntrustedDevice";
    public const string RepeatedFailedLogins = "RepeatedFailedLogins";
    public const string SensitiveAction = "SensitiveAction";
    public const string TrustedDevice = "TrustedDevice";

    private static readonly Dictionary<string, string> Descriptions = new(StringComparer.Ordinal)
    {
        [ImpossibleTravel] = "The distance from your previous activity could not be travelled in the time between the two events.",
        [LocationChange] = "Activity came from a different city than your previous activity.",
        [CountryChange] = "Activity came from a different country than your previous activity.",
        [NewDevice] = "A device we have not seen on your account before was used.",
        [UntrustedDevice] = "The device used is not one of your trusted devices.",
        [RepeatedFailedLogins] = "There were several failed sign-in attempts on your account recently.",
        [SensitiveAction] = "A sensitive credential action (sharing a QR code) was requested.",
        [TrustedDevice] = "The request came from a device you previously trusted, which lowers the risk.",
    };

    public static string Describe(string code) =>
        Descriptions.TryGetValue(code, out var description) ? description : code;

    public static string Serialize(IEnumerable<FraudSignal> signals) =>
        string.Join(",", signals.Select(s => $"{s.Code}:{s.Weight.ToString(CultureInfo.InvariantCulture)}"));

    public static List<FraudSignal> Deserialize(string? value)
    {
        var signals = new List<FraudSignal>();
        if (string.IsNullOrWhiteSpace(value))
        {
            return signals;
        }

        foreach (var part in value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var pieces = part.Split(':');
            if (pieces.Length == 2 &&
                pieces[0].Length > 0 &&
                int.TryParse(pieces[1], NumberStyles.Integer, CultureInfo.InvariantCulture, out var weight))
            {
                signals.Add(new FraudSignal(pieces[0], weight));
            }
        }

        return signals;
    }
}
