using System.Globalization;
using Microsoft.Extensions.Configuration;

namespace Application.Features.FraudDetection;

public class FraudDetectionOptions
{
    public const string SectionName = "FraudDetection";

    public TimeSpan LookbackWindow { get; set; } = TimeSpan.FromHours(24);

    public double MaxPlausibleSpeedKmh { get; set; } = 900;

    public double MinimumDistanceKm { get; set; } = 150;

    public TimeSpan NewDeviceGracePeriod { get; set; } = TimeSpan.FromHours(1);
    public int FailedLoginThreshold { get; set; } = 3;

    public int MediumRiskThreshold { get; set; } = 40;
    public int HighRiskThreshold { get; set; } = 70;
    public TimeSpan QrRestrictionDuration { get; set; } = TimeSpan.FromMinutes(30);
    public bool IgnoreDomesticJumpsOnSameDevice { get; set; } = true;

    public int ImpossibleTravelWeight { get; set; } = 50;
    public int LocationChangeWeight { get; set; } = 10;
    public int CountryChangeWeight { get; set; } = 10;
    public int NewDeviceWeight { get; set; } = 20;
    public int UntrustedDeviceWeight { get; set; } = 15;
    public int RepeatedFailedLoginsWeight { get; set; } = 15;
    public int SensitiveActionWeight { get; set; } = 10;
    public int TrustedDeviceReduction { get; set; } = 10;

    public static FraudDetectionOptions FromConfiguration(IConfiguration? configuration)
    {
        var options = new FraudDetectionOptions();
        if (configuration is null)
        {
            return options;
        }

        var section = configuration.GetSection(SectionName);

        options.LookbackWindow = TimeSpan.FromHours(ReadDouble(section, "LookbackHours", options.LookbackWindow.TotalHours));
        options.MaxPlausibleSpeedKmh = ReadDouble(section, "MaxPlausibleSpeedKmh", options.MaxPlausibleSpeedKmh);
        options.MinimumDistanceKm = ReadDouble(section, "MinimumDistanceKm", options.MinimumDistanceKm);
        options.NewDeviceGracePeriod = TimeSpan.FromMinutes(ReadDouble(section, "NewDeviceGraceMinutes", options.NewDeviceGracePeriod.TotalMinutes));
        options.FailedLoginThreshold = ReadInt(section, "FailedLoginThreshold", options.FailedLoginThreshold);
        options.MediumRiskThreshold = ReadInt(section, "MediumRiskThreshold", options.MediumRiskThreshold);
        options.HighRiskThreshold = ReadInt(section, "HighRiskThreshold", options.HighRiskThreshold);
        options.QrRestrictionDuration = TimeSpan.FromMinutes(ReadDouble(section, "QrRestrictionMinutes", options.QrRestrictionDuration.TotalMinutes));
        if (bool.TryParse(section["IgnoreDomesticJumpsOnSameDevice"], out var ignoreDomesticJumps))
        {
            options.IgnoreDomesticJumpsOnSameDevice = ignoreDomesticJumps;
        }

        options.ImpossibleTravelWeight = ReadInt(section, "Weights:ImpossibleTravel", options.ImpossibleTravelWeight);
        options.LocationChangeWeight = ReadInt(section, "Weights:LocationChange", options.LocationChangeWeight);
        options.CountryChangeWeight = ReadInt(section, "Weights:CountryChange", options.CountryChangeWeight);
        options.NewDeviceWeight = ReadInt(section, "Weights:NewDevice", options.NewDeviceWeight);
        options.UntrustedDeviceWeight = ReadInt(section, "Weights:UntrustedDevice", options.UntrustedDeviceWeight);
        options.RepeatedFailedLoginsWeight = ReadInt(section, "Weights:RepeatedFailedLogins", options.RepeatedFailedLoginsWeight);
        options.SensitiveActionWeight = ReadInt(section, "Weights:SensitiveAction", options.SensitiveActionWeight);
        options.TrustedDeviceReduction = ReadInt(section, "Weights:TrustedDeviceReduction", options.TrustedDeviceReduction);

        if (options.MediumRiskThreshold <= 0 || options.HighRiskThreshold <= options.MediumRiskThreshold)
        {
            var defaults = new FraudDetectionOptions();
            options.MediumRiskThreshold = defaults.MediumRiskThreshold;
            options.HighRiskThreshold = defaults.HighRiskThreshold;
        }

        return options;
    }

    private static double ReadDouble(IConfiguration section, string key, double fallback) =>
        double.TryParse(section[key], NumberStyles.Float, CultureInfo.InvariantCulture, out var value) && value > 0
            ? value
            : fallback;

    private static int ReadInt(IConfiguration section, string key, int fallback) =>
        int.TryParse(section[key], NumberStyles.Integer, CultureInfo.InvariantCulture, out var value) && value >= 0
            ? value
            : fallback;
}
