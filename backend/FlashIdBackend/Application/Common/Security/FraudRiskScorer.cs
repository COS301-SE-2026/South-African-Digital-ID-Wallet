using Application.Features.FraudDetection;
using Domain.Enums;

namespace Application.Common.Security;

public sealed class FraudRiskInput
{
    public TravelAnalysis? Travel { get; init; }
    public string? PreviousCountry { get; init; }
    public string? CurrentCountry { get; init; }
    public bool IsNewDevice { get; init; }
    public bool IsTrustedDevice { get; init; }
    public int RecentFailedLogins { get; init; }
    public bool IsSensitiveAction { get; init; }
}

public sealed record FraudRiskEvaluation(int Score, FraudRiskLevel Level, IReadOnlyList<FraudSignal> Signals)
{
    public bool Has(string code) => Signals.Any(s => s.Code == code);
}

public static class FraudRiskScorer
{
    public static FraudRiskEvaluation Evaluate(FraudRiskInput input, FraudDetectionOptions options)
    {
        ArgumentNullException.ThrowIfNull(input);
        ArgumentNullException.ThrowIfNull(options);

        var signals = new List<FraudSignal>();

        if (input.Travel is { IsImpossible: true })
        {
            signals.Add(new FraudSignal(FraudSignals.ImpossibleTravel, options.ImpossibleTravelWeight));
        }
        else if (input.Travel is { IsSignificantDistance: true })
        {
            signals.Add(new FraudSignal(FraudSignals.LocationChange, options.LocationChangeWeight));
        }

        if (!string.IsNullOrWhiteSpace(input.PreviousCountry) &&
            !string.IsNullOrWhiteSpace(input.CurrentCountry) &&
            !string.Equals(input.PreviousCountry.Trim(), input.CurrentCountry.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            signals.Add(new FraudSignal(FraudSignals.CountryChange, options.CountryChangeWeight));
        }

        if (input.IsNewDevice)
        {
            signals.Add(new FraudSignal(FraudSignals.NewDevice, options.NewDeviceWeight));
        }

        // Intentional: NewDevice and UntrustedDevice are separate signals. A brand-new device that has not
        // been verified gets both (+35); one that just passed the email OTP is trusted and only gets +20.
        if (!input.IsTrustedDevice)
        {
            signals.Add(new FraudSignal(FraudSignals.UntrustedDevice, options.UntrustedDeviceWeight));
        }
        else if (!input.IsNewDevice)
        {
            signals.Add(new FraudSignal(FraudSignals.TrustedDevice, -options.TrustedDeviceReduction));
        }

        if (input.RecentFailedLogins >= options.FailedLoginThreshold)
        {
            signals.Add(new FraudSignal(FraudSignals.RepeatedFailedLogins, options.RepeatedFailedLoginsWeight));
        }

        if (input.IsSensitiveAction)
        {
            signals.Add(new FraudSignal(FraudSignals.SensitiveAction, options.SensitiveActionWeight));
        }

        var score = Math.Clamp(signals.Sum(s => s.Weight), 0, 100);
        return new FraudRiskEvaluation(score, ToLevel(score, options), signals);
    }

    public static FraudRiskLevel ToLevel(int score, FraudDetectionOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        if (score >= options.HighRiskThreshold) return FraudRiskLevel.High;
        if (score >= options.MediumRiskThreshold) return FraudRiskLevel.Medium;
        return FraudRiskLevel.Low;
    }
}
