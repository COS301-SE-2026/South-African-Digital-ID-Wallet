using Application.Common.Security;
using Application.Features.FraudDetection;
using Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace tests;

public class FraudDetectionAlgorithmTests
{
    private const double JhbLat = -26.2041, JhbLon = 28.0473;
    private const double CptLat = -33.9249, CptLon = 18.4241;
    private const double PtaLat = -25.7479, PtaLon = 28.2293;
    private const double LonLat = 51.5074, LonLon = -0.1278;

    private static readonly DateTime T0 = new(2026, 5, 14, 16, 0, 0, DateTimeKind.Utc);
    private static readonly FraudDetectionOptions Options = new();

    [Fact]
    public void Haversine_JohannesburgToCapeTown_IsAbout1260Km()
    {
        var km = GeoDistance.HaversineKm(JhbLat, JhbLon, CptLat, CptLon);
        Assert.InRange(km, 1250, 1275);
    }

    [Fact]
    public void Haversine_JohannesburgToLondon_IsAbout9000Km()
    {
        var km = GeoDistance.HaversineKm(JhbLat, JhbLon, LonLat, LonLon);
        Assert.InRange(km, 9000, 9100);
    }

    [Fact]
    public void Haversine_IsSymmetric()
    {
        var there = GeoDistance.HaversineKm(JhbLat, JhbLon, LonLat, LonLon);
        var back = GeoDistance.HaversineKm(LonLat, LonLon, JhbLat, JhbLon);
        Assert.Equal(there, back, 6);
    }

    [Fact]
    public void Haversine_SamePoint_IsZero()
    {
        Assert.Equal(0, GeoDistance.HaversineKm(JhbLat, JhbLon, JhbLat, JhbLon), 6);
    }

    [Theory]
    [InlineData(91, 0)]
    [InlineData(-91, 0)]
    [InlineData(0, 181)]
    [InlineData(0, -181)]
    [InlineData(double.NaN, 0)]
    public void Haversine_InvalidCoordinates_Throws(double lat, double lon)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => GeoDistance.HaversineKm(lat, lon, 0, 0));
    }

    [Theory]
    [InlineData(0d, 0d, true)]
    [InlineData(90d, 180d, true)]
    [InlineData(-90d, -180d, true)]
    [InlineData(null, 0d, false)]
    [InlineData(0d, null, false)]
    [InlineData(95d, 0d, false)]
    public void IsValidCoordinate_ChecksRanges(double? lat, double? lon, bool expected)
    {
        Assert.Equal(expected, GeoDistance.IsValidCoordinate(lat, lon));
    }

    // ---------- ImpossibleTravelAnalyzer ----------

    [Fact]
    public void Analyze_JohannesburgToCapeTownInFiveMinutes_IsImpossible()
    {
        var result = ImpossibleTravelAnalyzer.Analyze(JhbLat, JhbLon, T0, CptLat, CptLon, T0.AddMinutes(5), Options);

        Assert.True(result.IsSignificantDistance);
        Assert.True(result.IsImpossible);
        Assert.Equal(5, result.ElapsedMinutes);
        Assert.True(result.ImpliedSpeedKmh > 15_000);
    }

    [Fact]
    public void Analyze_JohannesburgToCapeTownInThreeHours_IsPlausibleFlight()
    {
        var result = ImpossibleTravelAnalyzer.Analyze(JhbLat, JhbLon, T0, CptLat, CptLon, T0.AddHours(3), Options);

        Assert.True(result.IsSignificantDistance);
        Assert.False(result.IsImpossible);
        Assert.InRange(result.ImpliedSpeedKmh, 400, 450);
    }

    [Fact]
    public void Analyze_JohannesburgToPretoria_IsBelowIpAccuracyAndIgnored()
    {
        var result = ImpossibleTravelAnalyzer.Analyze(JhbLat, JhbLon, T0, PtaLat, PtaLon, T0.AddMinutes(1), Options);

        Assert.False(result.IsSignificantDistance);
        Assert.False(result.IsImpossible);
    }

    [Fact]
    public void Analyze_SameTimestamp_DoesNotDivideByZero()
    {
        var result = ImpossibleTravelAnalyzer.Analyze(JhbLat, JhbLon, T0, LonLat, LonLon, T0, Options);

        Assert.True(double.IsFinite(result.ImpliedSpeedKmh));
        Assert.True(result.IsImpossible);
    }

    [Fact]
    public void Analyze_ClockSkewWithNegativeElapsed_UsesAbsoluteDuration()
    {
        var result = ImpossibleTravelAnalyzer.Analyze(JhbLat, JhbLon, T0.AddHours(3), CptLat, CptLon, T0, Options);

        Assert.Equal(180, result.ElapsedMinutes);
        Assert.False(result.IsImpossible);
    }

    [Fact]
    public void Analyze_RespectsConfiguredSpeedLimit()
    {
        var strict = new FraudDetectionOptions { MaxPlausibleSpeedKmh = 300 };
        var result = ImpossibleTravelAnalyzer.Analyze(JhbLat, JhbLon, T0, CptLat, CptLon, T0.AddHours(3), strict);

        Assert.True(result.IsImpossible);
    }

    [Fact]
    public void Analyze_NullOptions_Throws()
    {
        Assert.Throws<ArgumentNullException>(() =>
            ImpossibleTravelAnalyzer.Analyze(0, 0, T0, 1, 1, T0, null!));
    }

    private static TravelAnalysis Impossible() =>
        ImpossibleTravelAnalyzer.Analyze(JhbLat, JhbLon, T0, CptLat, CptLon, T0.AddMinutes(5), Options);

    private static TravelAnalysis Plausible() =>
        ImpossibleTravelAnalyzer.Analyze(JhbLat, JhbLon, T0, CptLat, CptLon, T0.AddHours(3), Options);

    [Fact]
    public void Score_ImpossibleTravel_NewDevice_SensitiveAction_IsHighRisk()
    {
        var result = FraudRiskScorer.Evaluate(new FraudRiskInput
        {
            Travel = Impossible(),
            IsNewDevice = true,
            IsTrustedDevice = false,
            IsSensitiveAction = true,
        }, Options);

        Assert.Equal(FraudRiskLevel.High, result.Level);
        Assert.True(result.Has(FraudSignals.ImpossibleTravel));
        Assert.True(result.Has(FraudSignals.NewDevice));
        Assert.True(result.Has(FraudSignals.SensitiveAction));
        Assert.Equal(95, result.Score);
    }

    [Fact]
    public void Score_LocationChange_OnPreviouslyTrustedDevice_IsLowRisk()
    {
        var result = FraudRiskScorer.Evaluate(new FraudRiskInput
        {
            Travel = Plausible(),
            IsNewDevice = false,
            IsTrustedDevice = true,
        }, Options);

        Assert.Equal(FraudRiskLevel.Low, result.Level);
        Assert.True(result.Has(FraudSignals.LocationChange));
        Assert.True(result.Has(FraudSignals.TrustedDevice));
        Assert.False(result.Has(FraudSignals.ImpossibleTravel));
        Assert.Equal(0, result.Score);
    }

    [Fact]
    public void Score_ImpossibleTravel_OnPreviouslyTrustedDevice_IsMediumStepUpNotConviction()
    {
        var result = FraudRiskScorer.Evaluate(new FraudRiskInput
        {
            Travel = Impossible(),
            IsTrustedDevice = true,
        }, Options);

        Assert.Equal(FraudRiskLevel.Medium, result.Level);
        Assert.Equal(40, result.Score);
    }

    [Fact]
    public void Score_NewTrustedDevice_DoesNotGetTheTrustedReduction()
    {
        var result = FraudRiskScorer.Evaluate(new FraudRiskInput { IsNewDevice = true, IsTrustedDevice = true }, Options);

        Assert.True(result.Has(FraudSignals.NewDevice));
        Assert.False(result.Has(FraudSignals.TrustedDevice));
        Assert.False(result.Has(FraudSignals.UntrustedDevice));
    }

    [Fact]
    public void Score_CountryChange_IsCaseInsensitiveAndAdded()
    {
        var changed = FraudRiskScorer.Evaluate(new FraudRiskInput
        {
            PreviousCountry = "South Africa",
            CurrentCountry = "United Kingdom",
            IsTrustedDevice = true,
        }, Options);
        var same = FraudRiskScorer.Evaluate(new FraudRiskInput
        {
            PreviousCountry = "South Africa",
            CurrentCountry = " south africa ",
            IsTrustedDevice = true,
        }, Options);

        Assert.True(changed.Has(FraudSignals.CountryChange));
        Assert.False(same.Has(FraudSignals.CountryChange));
    }

    [Theory]
    [InlineData(2, false)]
    [InlineData(3, true)]
    [InlineData(10, true)]
    public void Score_RepeatedFailedLogins_UsesThreshold(int failures, bool expected)
    {
        var result = FraudRiskScorer.Evaluate(new FraudRiskInput { RecentFailedLogins = failures, IsTrustedDevice = true }, Options);
        Assert.Equal(expected, result.Has(FraudSignals.RepeatedFailedLogins));
    }

    [Fact]
    public void Score_IsClampedBetweenZeroAnd100()
    {
        var heavy = new FraudDetectionOptions { ImpossibleTravelWeight = 90, NewDeviceWeight = 90 };
        var high = FraudRiskScorer.Evaluate(new FraudRiskInput { Travel = Impossible(), IsNewDevice = true }, heavy);
        var low = FraudRiskScorer.Evaluate(new FraudRiskInput { IsTrustedDevice = true }, Options);

        Assert.Equal(100, high.Score);
        Assert.Equal(0, low.Score);
    }

    [Theory]
    [InlineData(0, FraudRiskLevel.Low)]
    [InlineData(39, FraudRiskLevel.Low)]
    [InlineData(40, FraudRiskLevel.Medium)]
    [InlineData(69, FraudRiskLevel.Medium)]
    [InlineData(70, FraudRiskLevel.High)]
    [InlineData(100, FraudRiskLevel.High)]
    public void ToLevel_UsesThresholds(int score, FraudRiskLevel expected)
    {
        Assert.Equal(expected, FraudRiskScorer.ToLevel(score, Options));
    }

    [Fact]
    public void Evaluate_NullArguments_Throw()
    {
        Assert.Throws<ArgumentNullException>(() => FraudRiskScorer.Evaluate(null!, Options));
        Assert.Throws<ArgumentNullException>(() => FraudRiskScorer.Evaluate(new FraudRiskInput(), null!));
    }

    [Fact]
    public void Signals_RoundTripThroughSerialization()
    {
        var signals = new[] { new FraudSignal(FraudSignals.ImpossibleTravel, 50), new FraudSignal(FraudSignals.TrustedDevice, -10) };

        var serialized = FraudSignals.Serialize(signals);
        var parsed = FraudSignals.Deserialize(serialized);

        Assert.Equal("ImpossibleTravel:50,TrustedDevice:-10", serialized);
        Assert.Equal(signals, parsed);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("garbage")]
    [InlineData(":10,Code:notanumber")]
    public void Signals_DeserializeIgnoresMalformedInput(string? value)
    {
        Assert.Empty(FraudSignals.Deserialize(value));
    }

    [Fact]
    public void Signals_DescribeKnownAndUnknownCodes()
    {
        Assert.Contains("distance", FraudSignals.Describe(FraudSignals.ImpossibleTravel));
        Assert.Equal("SomethingElse", FraudSignals.Describe("SomethingElse"));
    }

    [Fact]
    public void Options_FromNullConfiguration_UsesDefaults()
    {
        var options = FraudDetectionOptions.FromConfiguration(null);

        Assert.Equal(900, options.MaxPlausibleSpeedKmh);
        Assert.Equal(TimeSpan.FromHours(24), options.LookbackWindow);
        Assert.Equal(70, options.HighRiskThreshold);
    }

    [Fact]
    public void Options_FromConfiguration_OverridesValues()
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["FraudDetection:MaxPlausibleSpeedKmh"] = "1000",
            ["FraudDetection:LookbackHours"] = "12",
            ["FraudDetection:QrRestrictionMinutes"] = "60",
            ["FraudDetection:Weights:ImpossibleTravel"] = "60",
            ["FraudDetection:MediumRiskThreshold"] = "30",
            ["FraudDetection:HighRiskThreshold"] = "80",
        }).Build();

        var options = FraudDetectionOptions.FromConfiguration(config);

        Assert.Equal(1000, options.MaxPlausibleSpeedKmh);
        Assert.Equal(TimeSpan.FromHours(12), options.LookbackWindow);
        Assert.Equal(TimeSpan.FromMinutes(60), options.QrRestrictionDuration);
        Assert.Equal(60, options.ImpossibleTravelWeight);
        Assert.Equal(30, options.MediumRiskThreshold);
        Assert.Equal(80, options.HighRiskThreshold);
    }

    [Fact]
    public void Options_FromConfiguration_IgnoresInvalidValuesAndInconsistentThresholds()
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["FraudDetection:MaxPlausibleSpeedKmh"] = "fast",
            ["FraudDetection:MinimumDistanceKm"] = "-5",
            ["FraudDetection:MediumRiskThreshold"] = "90",
            ["FraudDetection:HighRiskThreshold"] = "50",
        }).Build();

        var options = FraudDetectionOptions.FromConfiguration(config);

        Assert.Equal(900, options.MaxPlausibleSpeedKmh);
        Assert.Equal(150, options.MinimumDistanceKm);
        Assert.Equal(40, options.MediumRiskThreshold);
        Assert.Equal(70, options.HighRiskThreshold);
    }

    [Theory]
    [InlineData("41.0.0.1", true)]
    [InlineData("8.8.8.8", true)]
    [InlineData("2001:4860:4860::8888", true)]
    [InlineData("::ffff:41.0.0.1", true)]
    [InlineData("127.0.0.1", false)]
    [InlineData("::1", false)]
    [InlineData("10.1.2.3", false)]
    [InlineData("172.16.0.1", false)]
    [InlineData("172.31.255.255", false)]
    [InlineData("192.168.1.10", false)]
    [InlineData("169.254.1.1", false)]
    [InlineData("100.64.0.1", false)]
    [InlineData("fe80::1", false)]
    [InlineData("fd00::1", false)]
    [InlineData("unknown", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void IpAddressClassifier_IdentifiesPublicAddresses(string? ip, bool expected)
    {
        Assert.Equal(expected, IpAddressClassifier.IsPublic(ip));
    }

    [Theory]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Chrome on Windows")]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36 Edg/124.0", "Edge on Windows")]
    [InlineData("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1", "Safari on iOS")]
    [InlineData("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Gecko/20100101 Firefox/125.0", "Firefox on macOS")]
    [InlineData("Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124.0 Mobile Safari/537.36", "Chrome on Android")]
    [InlineData("okhttp/4.12.0", "FlashID app on Android")]
    [InlineData("FlashID/1 CFNetwork/1490 Darwin/23.0.0", "FlashID app on iOS")]
    [InlineData("", "Unknown device")]
    [InlineData(null, "Unknown device")]
    [InlineData("curl-ish-thing", "Unknown device")]
    public void UserAgentDescriber_ProducesFriendlyNames(string? userAgent, string expected)
    {
        Assert.Equal(expected, UserAgentDescriber.Describe(userAgent));
    }

    [Theory]
    [InlineData("Johannesburg", true)]
    [InlineData("  cape town ", true)]
    [InlineData("LONDON", true)]
    [InlineData("Atlantis", false)]
    [InlineData(null, false)]
    public void KnownLocations_ResolvesCities(string? city, bool expected)
    {
        var found = KnownLocations.TryGetCoordinates(city, out var lat, out var lon);

        Assert.Equal(expected, found);
        if (expected)
        {
            Assert.True(GeoDistance.IsValidCoordinate(lat, lon));
        }
    }
}
