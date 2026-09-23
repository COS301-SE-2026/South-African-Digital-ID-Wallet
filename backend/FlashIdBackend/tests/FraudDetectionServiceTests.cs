using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Security;
using Application.Common.Services;
using Application.Features.FraudDetection;
using Application.Features.FraudDetection.DTOs;
using Application.Features.FraudDetection.Exceptions;
using Application.Features.ManageUserAccountCard.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace tests;

public class FraudDetectionServiceTests
{
    private const string JohannesburgIp = "41.0.0.1";
    private const string CapeTownIp = "196.25.1.1";
    private const string LondonIp = "81.2.69.160";
    private const string Password = "Correct#Pass1"; // NOSONAR - test-only dummy credential

    private static readonly DateTimeOffset Start = new(2026, 5, 14, 14, 0, 0, TimeSpan.Zero);

    private sealed class MutableTimeProvider : TimeProvider
    {
        public DateTimeOffset Now { get; set; } = Start;
        public override DateTimeOffset GetUtcNow() => Now;
        public void Advance(TimeSpan by) => Now = Now.Add(by);
    }

    private sealed class FakeGeolocation : IIpGeolocationProvider
    {
        public bool Throw { get; set; }
        public Dictionary<string, IpLocationResult> Locations { get; } = new()
        {
            [JohannesburgIp] = new IpLocationResult { City = "Johannesburg", Country = "South Africa", Latitude = -26.2041, Longitude = 28.0473 },
            [CapeTownIp] = new IpLocationResult { City = "Cape Town", Country = "South Africa", Latitude = -33.9249, Longitude = 18.4241 },
            [LondonIp] = new IpLocationResult { City = "London", Country = "United Kingdom", Latitude = 51.5074, Longitude = -0.1278 },
        };

        public Task<IpLocationResult?> GetLocationAsync(string ipAddress, CancellationToken cancellationToken)
        {
            if (Throw) throw new HttpRequestException("geolocation down");
            return Task.FromResult(Locations.TryGetValue(ipAddress, out var l) ? l : null);
        }
    }

    private sealed class FakeDeviceTokenProvider : IDeviceTokenProvider
    {
        public string GenerateToken() => "generated-token";
        public string HashToken(string token) => $"hash-{token}";
    }

    private sealed class FakePasswordHashingProvider : IPasswordHashingProvider
    {
        public string HashPassword(string password) => $"hashed:{password}";
        public bool VerifyPassword(string password, string storedHash) => storedHash == $"hashed:{password}";
    }

    private sealed class FakeJwtTokenProvider : IJwtTokenProvider
    {
        public (string Token, DateTime ExpiresAt) GenerateToken(User user, bool rememberMe = false) =>
            ($"jwt-v{user.TokenVersion}", new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc));
    }

    private sealed class Harness : IDisposable
    {
        public AppDbContext Db { get; }
        public MutableTimeProvider Time { get; } = new();
        public FakeGeolocation Geo { get; } = new();
        public FraudDetectionService Service { get; }
        public User User { get; }
        public Citizen Citizen { get; }

        public Harness(FraudDetectionOptions? options = null)
        {
            Db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);

            User = new User
            {
                Id = Guid.NewGuid(),
                Email = "thabo@flashid.test",
                PhoneNumber = "+27821234567",
                PasswordHash = $"hashed:{Password}",
                Role = UserRole.Citizen,
                IsEmailVerified = true,
                TokenVersion = 3,
                CreatedAt = Start.UtcDateTime.AddYears(-1),
                UpdatedAt = Start.UtcDateTime.AddYears(-1),
            };
            Citizen = new Citizen
            {
                Id = Guid.NewGuid(),
                SaId = "9001015800086",
                Names = "Thabo",
                Surname = "Mokoena",
                DateOfBirth = new DateTime(1990, 1, 1),
                UserId = User.Id,
                CreatedAt = Start.UtcDateTime,
                UpdatedAt = Start.UtcDateTime,
            };
            Db.DomainUsers.Add(User);
            Db.Citizens.Add(Citizen);
            Db.SaveChanges();

            Service = new FraudDetectionService(
                new FraudDetectionRepository(Db),
                Geo,
                new FakeDeviceTokenProvider(),
                new FakePasswordHashingProvider(),
                new FakeJwtTokenProvider(),
                options ?? new FraudDetectionOptions(),
                Time,
                NullLogger<FraudDetectionService>.Instance);
        }

        public SecurityEventContext Context(string ip, SecurityEventType type = SecurityEventType.Login, string? deviceToken = null) => new()
        {
            UserId = User.Id,
            EventType = type,
            IpAddress = ip,
            DeviceToken = deviceToken,
            UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36",
        };

        public void TrustDevice(string rawToken, string name = "Thabo's Laptop", DateTime? createdAt = null)
        {
            Db.TrustedDevices.Add(new TrustedDevice
            {
                Id = Guid.NewGuid(),
                UserId = User.Id,
                DeviceTokenHash = $"hash-{rawToken}",
                DeviceType = DeviceType.Laptop,
                OperatingSystem = "Windows 11",
                Browser = "Chrome",
                DeviceName = name,
                LastActive = Start.UtcDateTime,
                IsTrusted = true,
                CreatedAt = createdAt ?? Start.UtcDateTime.AddDays(-30),
                UpdatedAt = Start.UtcDateTime,
            });
            Db.SaveChanges();
        }

        public async Task<FraudAssessmentResultDto> JohannesburgThenLondonAsync(string? londonDevice = "attacker-device")
        {
            await Service.RecordSecurityEventAsync(Context(JohannesburgIp, deviceToken: "home-device"), CancellationToken.None);
            Time.Advance(TimeSpan.FromMinutes(10));
            return await Service.RecordSecurityEventAsync(Context(LondonIp, deviceToken: londonDevice), CancellationToken.None);
        }

        public void Dispose() => Db.Dispose();
    }

    [Fact]
    public async Task Record_FirstEvent_PersistsLocatedEventWithoutAlert()
    {
        using var h = new Harness();

        var result = await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp), CancellationToken.None);

        Assert.True(result.Assessed);
        Assert.Null(result.AlertId);
        Assert.Equal(FraudRiskLevel.Low, result.RiskLevel);

        var evt = Assert.Single(h.Db.SecurityEvents);
        Assert.Equal("Johannesburg", evt.City);
        Assert.Equal(-26.2041, evt.Latitude);
        Assert.Equal("Chrome on Windows", evt.DeviceDescription);
        Assert.Empty(h.Db.FraudAlerts);
    }

    [Fact]
    public async Task Record_ImpossibleTravelOnNewDevice_CreatesHighAlertNotifiesAndRestrictsQr()
    {
        using var h = new Harness();

        var result = await h.JohannesburgThenLondonAsync();

        Assert.Equal(FraudRiskLevel.High, result.RiskLevel);
        Assert.True(result.RequiresStepUp);
        Assert.Contains(FraudSignals.ImpossibleTravel, result.Signals);
        Assert.Contains(FraudSignals.NewDevice, result.Signals);
        Assert.InRange(result.DistanceKm!.Value, 9000, 9100);
        Assert.NotNull(result.Notice);
        Assert.Equal("Possible impossible travel", result.Notice!.Title);
        Assert.Contains("London", result.Notice.Message);
        Assert.Contains("Johannesburg", result.Notice.Message);

        var alert = Assert.Single(h.Db.FraudAlerts);
        Assert.Equal(result.AlertId, alert.Id);
        Assert.True(alert.IsImpossibleTravel);
        Assert.Equal(FraudAlertStatus.Open, alert.Status);
        Assert.NotNull(alert.PreviousSecurityEventId);

        var profile = Assert.Single(h.Db.UserSecurityProfiles);
        Assert.Equal(Start.UtcDateTime.AddMinutes(10 + 30), profile.QrRestrictedUntil);

        var notification = Assert.Single(h.Db.Notifications);
        Assert.Equal(h.Citizen.Id, notification.CitizenId);
        Assert.Contains("Possible impossible travel", notification.Title);

        Assert.Contains(h.Db.AuditLogs, a => a.EventType == AuditEventType.ImpossibleTravelDetected && a.CitizenId == h.Citizen.Id);
        Assert.Contains(h.Db.AuditLogs, a => a.EventType == AuditEventType.QrGenerationRestricted);
    }

    [Fact]
    public async Task Record_ImpossibleTravelOnPreviouslyTrustedDevice_IsMediumWithoutRestriction()
    {
        using var h = new Harness();
        h.TrustDevice("home-device");

        var result = await h.JohannesburgThenLondonAsync(londonDevice: "home-device");

        Assert.Equal(FraudRiskLevel.Medium, result.RiskLevel);
        Assert.False(result.RequiresStepUp);
        Assert.NotNull(result.AlertId);
        Assert.Null(h.Db.UserSecurityProfiles.Single().QrRestrictedUntil);
        Assert.Equal("Thabo's Laptop", h.Db.SecurityEvents.OrderBy(e => e.OccurredAt).Last().DeviceDescription);
    }

    [Fact]
    public async Task Record_JohannesburgToCapeTownAfterThreeHours_IsNotFlagged()
    {
        using var h = new Harness();
        h.TrustDevice("home-device");

        await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp, deviceToken: "home-device"), CancellationToken.None);
        h.Time.Advance(TimeSpan.FromHours(3));
        var result = await h.Service.RecordSecurityEventAsync(h.Context(CapeTownIp, deviceToken: "home-device"), CancellationToken.None);

        Assert.Equal(FraudRiskLevel.Low, result.RiskLevel);
        Assert.Contains(FraudSignals.LocationChange, result.Signals);
        Assert.Null(result.AlertId);
        Assert.Empty(h.Db.FraudAlerts);
    }

    [Fact]
    public async Task Record_EventsOutsideLookbackWindow_AreNotCorrelated()
    {
        using var h = new Harness();

        await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp), CancellationToken.None);
        h.Time.Advance(TimeSpan.FromHours(25));
        var result = await h.Service.RecordSecurityEventAsync(h.Context(LondonIp), CancellationToken.None);

        Assert.DoesNotContain(FraudSignals.ImpossibleTravel, result.Signals);
        Assert.Null(result.DistanceKm);
    }

    [Fact]
    public async Task Record_WhenTravelDetectionDisabled_SkipsTravelSignals()
    {
        using var h = new Harness();
        await h.Service.UpdateSettingsAsync(h.User.Id,
            new UpdateSecuritySettingsRequestDto { ImpossibleTravelDetectionEnabled = false, Password = Password }, "1.1.1.1", CancellationToken.None);

        var result = await h.JohannesburgThenLondonAsync();

        Assert.DoesNotContain(FraudSignals.ImpossibleTravel, result.Signals);
        Assert.DoesNotContain(FraudSignals.CountryChange, result.Signals);
        Assert.False(result.RequiresStepUp);
    }

    [Fact]
    public async Task Record_PrivateIp_UsesDeviceReportedLocationHint()
    {
        using var h = new Harness();
        var context = h.Context("192.168.1.20");
        context.ClientLatitude = -33.9249;
        context.ClientLongitude = 18.4241;
        context.ClientCity = "Cape Town";

        await h.Service.RecordSecurityEventAsync(context, CancellationToken.None);

        var evt = Assert.Single(h.Db.SecurityEvents);
        Assert.Equal("Cape Town", evt.City);
        Assert.Equal(-33.9249, evt.Latitude);
    }

    [Fact]
    public async Task Record_PublicIpLocation_WinsOverDeviceHint()
    {
        using var h = new Harness();
        var context = h.Context(JohannesburgIp);
        context.ClientLatitude = 51.5;
        context.ClientLongitude = -0.12;

        await h.Service.RecordSecurityEventAsync(context, CancellationToken.None);

        Assert.Equal("Johannesburg", h.Db.SecurityEvents.Single().City);
    }

    [Fact]
    public async Task Record_CityOnlyGeolocation_FallsBackToKnownCoordinates()
    {
        using var h = new Harness();
        h.Geo.Locations[JohannesburgIp] = new IpLocationResult { City = "Durban", Country = "South Africa" };

        await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp), CancellationToken.None);

        var evt = h.Db.SecurityEvents.Single();
        Assert.Equal("Durban", evt.City);
        Assert.NotNull(evt.Latitude);
    }

    [Fact]
    public async Task Record_GeolocationFailure_StillRecordsEventWithoutLocation()
    {
        using var h = new Harness();
        h.Geo.Throw = true;

        var result = await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp), CancellationToken.None);

        Assert.True(result.Assessed);
        var evt = Assert.Single(h.Db.SecurityEvents);
        Assert.Null(evt.Latitude);
        Assert.Null(evt.City);
    }

    [Fact]
    public async Task Record_RepeatedFailedLogins_AddsSignal()
    {
        using var h = new Harness();
        for (var i = 0; i < 3; i++)
        {
            h.Db.AuditLogs.Add(new AuditLog
            {
                Id = Guid.NewGuid(),
                ActorId = h.User.Id,
                EventType = AuditEventType.FailedLoginAttempt,
                Details = "bad password",
                IpAddress = LondonIp,
                CreatedAt = Start.UtcDateTime.AddMinutes(-5),
            });
        }
        h.Db.SaveChanges();

        var result = await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp), CancellationToken.None);

        Assert.Contains(FraudSignals.RepeatedFailedLogins, result.Signals);
    }

    [Fact]
    public async Task Record_SeenDevice_IsNotNewTheSecondTime()
    {
        using var h = new Harness();

        var first = await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp, deviceToken: "phone"), CancellationToken.None);
        var second = await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp, deviceToken: "phone"), CancellationToken.None);

        Assert.True(first.IsNewDevice);
        Assert.False(second.IsNewDevice);
    }

    [Fact]
    public async Task Record_NullContext_Throws()
    {
        using var h = new Harness();
        await Assert.ThrowsAsync<ArgumentNullException>(() => h.Service.RecordSecurityEventAsync(null!, CancellationToken.None));
    }

    [Fact]
    public async Task Qr_EnsureAllowed_DoesNotRecordAnEvent()
    {
        using var h = new Harness();

        await h.Service.EnsureQrGenerationAllowedAsync(h.Context(JohannesburgIp), CancellationToken.None);

        Assert.Empty(h.Db.SecurityEvents);
    }

    [Fact]
    public async Task Qr_LowRisk_IsRecordedAfterGeneration()
    {
        using var h = new Harness();

        var result = await h.Service.RecordQrGenerationAsync(h.Context(JohannesburgIp), CancellationToken.None);

        Assert.Equal(FraudRiskLevel.Low, result.RiskLevel);
        Assert.Contains(FraudSignals.SensitiveAction, result.Signals);
        Assert.Equal(SecurityEventType.QrGenerated, h.Db.SecurityEvents.Single().EventType);
    }

    [Fact]
    public async Task Qr_ImpossibleTravel_IsWithheldWithAlertId()
    {
        using var h = new Harness();
        await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp, deviceToken: "home-device"), CancellationToken.None);
        h.Time.Advance(TimeSpan.FromMinutes(5));

        var ex = await Assert.ThrowsAsync<QrGenerationRestrictedException>(() =>
            h.Service.RecordQrGenerationAsync(h.Context(CapeTownIp), CancellationToken.None));

        Assert.Equal(QrGenerationRestrictedException.RiskRestriction, ex.Code);
        Assert.NotNull(ex.AlertId);
        Assert.NotNull(ex.RestrictedUntil);
    }

    [Fact]
    public async Task Qr_WhileRestricted_IsBlockedAndAuditedWithoutRecordingAnEvent()
    {
        using var h = new Harness();
        var high = await h.JohannesburgThenLondonAsync();
        var eventsBefore = h.Db.SecurityEvents.Count();
        h.Time.Advance(TimeSpan.FromMinutes(1));

        var ex = await Assert.ThrowsAsync<QrGenerationRestrictedException>(() =>
            h.Service.EnsureQrGenerationAllowedAsync(h.Context(JohannesburgIp, deviceToken: "home-device"), CancellationToken.None));

        Assert.Equal(high.AlertId, ex.AlertId);
        Assert.Contains(h.Db.AuditLogs, a => a.EventType == AuditEventType.QrGenerationBlocked);
        Assert.Equal(eventsBefore, h.Db.SecurityEvents.Count());
    }

    [Fact]
    public async Task Qr_AfterRestrictionExpires_IsAllowedAgain()
    {
        using var h = new Harness();
        await h.JohannesburgThenLondonAsync();
        h.Time.Advance(TimeSpan.FromMinutes(31));

        await h.Service.EnsureQrGenerationAllowedAsync(h.Context(LondonIp, deviceToken: "attacker-device"), CancellationToken.None);
        var result = await h.Service.RecordQrGenerationAsync(h.Context(LondonIp, deviceToken: "attacker-device"), CancellationToken.None);

        Assert.True(result.Assessed);
    }

    [Fact]
    public async Task Qr_WithExtraVerification_RequiresTrustedDevice()
    {
        using var h = new Harness();
        h.TrustDevice("home-device");
        await h.Service.UpdateSettingsAsync(h.User.Id, new UpdateSecuritySettingsRequestDto { EnhancedVerificationEnabled = true }, "1.1.1.1", CancellationToken.None);

        var ex = await Assert.ThrowsAsync<QrGenerationRestrictedException>(() =>
            h.Service.EnsureQrGenerationAllowedAsync(h.Context(JohannesburgIp, deviceToken: "unknown-device"), CancellationToken.None));
        await h.Service.EnsureQrGenerationAllowedAsync(h.Context(JohannesburgIp, deviceToken: "home-device"), CancellationToken.None);

        Assert.Equal(QrGenerationRestrictedException.TrustedDeviceRequired, ex.Code);
        Assert.Empty(h.Db.SecurityEvents);
    }

    // ---------- SA network routing ----------

    [Fact]
    public async Task Record_SameDeviceJumpingBetweenSaCities_IsTreatedAsRoutingNotTravel()
    {
        using var h = new Harness();
        h.TrustDevice("home-device");

        await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp, deviceToken: "home-device"), CancellationToken.None);
        h.Time.Advance(TimeSpan.FromMinutes(2));
        var result = await h.Service.RecordSecurityEventAsync(h.Context(CapeTownIp, deviceToken: "home-device"), CancellationToken.None);

        Assert.DoesNotContain(FraudSignals.ImpossibleTravel, result.Signals);
        Assert.Equal(FraudRiskLevel.Low, result.RiskLevel);
        Assert.Empty(h.Db.FraudAlerts);
    }

    [Fact]
    public async Task Record_DifferentDeviceJumpingBetweenSaCities_IsStillImpossibleTravel()
    {
        using var h = new Harness();

        await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp, deviceToken: "home-device"), CancellationToken.None);
        h.Time.Advance(TimeSpan.FromMinutes(2));
        var result = await h.Service.RecordSecurityEventAsync(h.Context(CapeTownIp, deviceToken: "other-device"), CancellationToken.None);

        Assert.Contains(FraudSignals.ImpossibleTravel, result.Signals);
    }

    [Fact]
    public async Task Record_SameDeviceJumpingToAnotherCountry_IsStillImpossibleTravel()
    {
        using var h = new Harness();
        h.TrustDevice("home-device");

        await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp, deviceToken: "home-device"), CancellationToken.None);
        h.Time.Advance(TimeSpan.FromMinutes(2));
        var result = await h.Service.RecordSecurityEventAsync(h.Context(LondonIp, deviceToken: "home-device"), CancellationToken.None);

        Assert.Contains(FraudSignals.ImpossibleTravel, result.Signals);
    }

    [Fact]
    public async Task Record_RoutingToleranceCanBeSwitchedOff()
    {
        using var h = new Harness(new FraudDetectionOptions { IgnoreDomesticJumpsOnSameDevice = false });
        h.TrustDevice("home-device");

        await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp, deviceToken: "home-device"), CancellationToken.None);
        h.Time.Advance(TimeSpan.FromMinutes(2));
        var result = await h.Service.RecordSecurityEventAsync(h.Context(CapeTownIp, deviceToken: "home-device"), CancellationToken.None);

        Assert.Contains(FraudSignals.ImpossibleTravel, result.Signals);
    }

    [Fact]
    public async Task Overview_NoActivity_IsEmpty()
    {
        using var h = new Harness();

        var overview = await h.Service.GetSecurityOverviewAsync(h.User.Id, CancellationToken.None);

        Assert.False(overview.HasActiveAlert);
        Assert.Null(overview.LatestAlert);
        Assert.False(overview.QrGenerationRestricted);
        Assert.Empty(overview.RecentActivity);
    }

    [Fact]
    public async Task Overview_AfterImpossibleTravel_ShowsAlertRestrictionAndActivity()
    {
        using var h = new Harness();
        var result = await h.JohannesburgThenLondonAsync();

        var overview = await h.Service.GetSecurityOverviewAsync(h.User.Id, CancellationToken.None);

        Assert.True(overview.HasActiveAlert);
        Assert.Equal(1, overview.ActiveAlertCount);
        Assert.Equal(result.AlertId, overview.LatestAlert!.Id);
        Assert.Equal("Johannesburg, South Africa", overview.LatestAlert.PreviousLocationLabel);
        Assert.Equal("London, United Kingdom", overview.LatestAlert.SuspiciousLocationLabel);
        Assert.True(overview.QrGenerationRestricted);
        Assert.Equal(DateTimeKind.Utc, overview.QrRestrictedUntil!.Value.Kind);
        Assert.Equal(2, overview.RecentActivity.Count);
        Assert.True(overview.RecentActivity[0].IsSuspicious);
        Assert.Equal("London, United Kingdom", overview.RecentActivity[0].LocationLabel);
    }

    [Fact]
    public async Task Activity_LimitIsClamped()
    {
        using var h = new Harness();
        for (var i = 0; i < 3; i++)
        {
            await h.Service.RecordSecurityEventAsync(h.Context(JohannesburgIp), CancellationToken.None);
            h.Time.Advance(TimeSpan.FromMinutes(1));
        }

        Assert.Single(await h.Service.GetActivityAsync(h.User.Id, 0, CancellationToken.None));
        Assert.Equal(3, (await h.Service.GetActivityAsync(h.User.Id, 500, CancellationToken.None)).Count);
    }

    [Fact]
    public async Task AlertDetails_ContainsMapCoordinatesSignalsAndActions()
    {
        using var h = new Harness();
        var result = await h.JohannesburgThenLondonAsync();

        var details = await h.Service.GetAlertDetailsAsync(h.User.Id, result.AlertId!.Value, CancellationToken.None);

        Assert.Equal(LondonIp, details.IpAddress);
        Assert.Equal(51.5074, details.SuspiciousLocation.Latitude);
        Assert.Equal(-26.2041, details.PreviousLocation!.Latitude);
        Assert.Equal(10, details.ElapsedMinutes);
        Assert.Contains(details.Signals, s => s.Code == FraudSignals.ImpossibleTravel && s.Weight == 50 && s.Description.Length > 0);
        Assert.Equal(3, details.AvailableActions.Count);
        Assert.Single(details.AvailableActions, a => a.IsRecommended);
    }

    [Fact]
    public async Task AlertDetails_ForAnotherUsersAlert_IsNotFound()
    {
        using var h = new Harness();
        var result = await h.JohannesburgThenLondonAsync();

        await Assert.ThrowsAsync<FraudAlertNotFoundException>(() =>
            h.Service.GetAlertDetailsAsync(Guid.NewGuid(), result.AlertId!.Value, CancellationToken.None));
    }

    [Fact]
    public async Task Alerts_FilterByStatus()
    {
        using var h = new Harness();
        await h.JohannesburgThenLondonAsync();

        Assert.Single(await h.Service.GetAlertsAsync(h.User.Id, FraudAlertStatus.Open, CancellationToken.None));
        Assert.Empty(await h.Service.GetAlertsAsync(h.User.Id, FraudAlertStatus.Secured, CancellationToken.None));
        Assert.Single(await h.Service.GetAlertsAsync(h.User.Id, null, CancellationToken.None));
    }

    [Fact]
    public async Task Secure_LogOutOtherDevices_RevokesSessionsRemovesSuspiciousDeviceAndLiftsRestriction()
    {
        using var h = new Harness();
        h.TrustDevice("home-device");
        h.TrustDevice("attacker-device", "Chrome on Windows", Start.UtcDateTime);
        var alert = await h.JohannesburgThenLondonAsync();

        var result = await h.Service.SecureAccountAsync(h.User.Id, alert.AlertId!.Value,
            new SecureAccountRequestDto { Action = SecureAccountAction.LogOutOtherDevices, Password = Password }, "home-device", "1.1.1.1", CancellationToken.None);

        Assert.Equal("Your account is secured", result.Title);
        Assert.Equal(1, result.DevicesRemoved);
        Assert.Equal("jwt-v4", result.Token);
        Assert.False(result.RequiresPasswordChange);
        Assert.Equal(3, result.NextSteps.Count);

        Assert.Equal(4, h.Db.DomainUsers.Single().TokenVersion);
        Assert.Single(h.Db.TrustedDevices, d => d.DeviceTokenHash == "hash-home-device");
        Assert.DoesNotContain(h.Db.TrustedDevices, d => d.DeviceTokenHash == "hash-attacker-device");
        Assert.Null(h.Db.UserSecurityProfiles.Single().QrRestrictedUntil);

        var stored = h.Db.FraudAlerts.Single();
        Assert.Equal(FraudAlertStatus.Secured, stored.Status);
        Assert.Equal(SecureAccountAction.LogOutOtherDevices, stored.ResolutionAction);
        Assert.NotNull(stored.ResolvedAt);
        Assert.Contains(h.Db.AuditLogs, a => a.EventType == AuditEventType.FraudAlertSecured);
    }

    [Fact]
    public async Task Secure_ResetPassword_FlagsPasswordChange()
    {
        using var h = new Harness();
        var alert = await h.JohannesburgThenLondonAsync();

        var result = await h.Service.SecureAccountAsync(h.User.Id, alert.AlertId!.Value,
            new SecureAccountRequestDto { Action = SecureAccountAction.ResetPassword, Password = Password }, null, "1.1.1.1", CancellationToken.None);

        Assert.True(result.RequiresPasswordChange);
        Assert.Equal(SecureAccountAction.ResetPassword, h.Db.FraudAlerts.Single().ResolutionAction);
    }

    [Fact]
    public async Task Secure_AddExtraVerification_RemovesAllOtherDevicesAndEnablesStrictMode()
    {
        using var h = new Harness();
        h.TrustDevice("home-device");
        h.TrustDevice("tablet");
        h.TrustDevice("old-phone");
        var alert = await h.JohannesburgThenLondonAsync();

        var result = await h.Service.SecureAccountAsync(h.User.Id, alert.AlertId!.Value,
            new SecureAccountRequestDto { Action = SecureAccountAction.AddExtraVerification, Password = Password }, "home-device", "1.1.1.1", CancellationToken.None);

        Assert.Equal(2, result.DevicesRemoved);
        Assert.Single(h.Db.TrustedDevices);
        Assert.True(h.Db.UserSecurityProfiles.Single().EnhancedVerificationEnabled);
    }

    [Fact]
    public async Task Secure_AlreadyResolved_Throws()
    {
        using var h = new Harness();
        var alert = await h.JohannesburgThenLondonAsync();
        var request = new SecureAccountRequestDto { Action = SecureAccountAction.LogOutOtherDevices, Password = Password };
        await h.Service.SecureAccountAsync(h.User.Id, alert.AlertId!.Value, request, null, "1.1.1.1", CancellationToken.None);

        await Assert.ThrowsAsync<FraudAlertAlreadyResolvedException>(() =>
            h.Service.SecureAccountAsync(h.User.Id, alert.AlertId!.Value, request, null, "1.1.1.1", CancellationToken.None));
    }

    [Fact]
    public async Task Secure_UnknownAlertOrAction_Throws()
    {
        using var h = new Harness();
        var alert = await h.JohannesburgThenLondonAsync();

        await Assert.ThrowsAsync<FraudAlertNotFoundException>(() =>
            h.Service.SecureAccountAsync(h.User.Id, Guid.NewGuid(), new SecureAccountRequestDto(), null, "1.1.1.1", CancellationToken.None));
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() =>
            h.Service.SecureAccountAsync(h.User.Id, alert.AlertId!.Value, new SecureAccountRequestDto { Action = (SecureAccountAction)99, Password = Password }, null, "1.1.1.1", CancellationToken.None));
    }

    [Fact]
    public async Task Dismiss_WrongPassword_FailsAuditsAndKeepsAlertOpen()
    {
        using var h = new Harness();
        var alert = await h.JohannesburgThenLondonAsync();

        await Assert.ThrowsAsync<StepUpVerificationFailedException>(() =>
            h.Service.DismissAlertAsync(h.User.Id, alert.AlertId!.Value, new DismissFraudAlertRequestDto { Password = "wrong" }, "1.1.1.1", CancellationToken.None));

        Assert.Equal(FraudAlertStatus.Open, h.Db.FraudAlerts.Single().Status);
        Assert.Equal(1, h.Db.DomainUsers.Single().FailedLoginAttempts);
        Assert.Contains(h.Db.AuditLogs, a => a.EventType == AuditEventType.FailedLoginAttempt);
    }

    [Fact]
    public async Task Dismiss_FiveWrongPasswords_LocksTheAccount()
    {
        using var h = new Harness();
        var alert = await h.JohannesburgThenLondonAsync();

        for (var i = 0; i < 5; i++)
        {
            await Assert.ThrowsAsync<StepUpVerificationFailedException>(() =>
                h.Service.DismissAlertAsync(h.User.Id, alert.AlertId!.Value, new DismissFraudAlertRequestDto { Password = "wrong" }, "1.1.1.1", CancellationToken.None));
        }

        Assert.NotNull(h.Db.DomainUsers.Single().LockoutUntil);
        await Assert.ThrowsAsync<StepUpVerificationFailedException>(() =>
            h.Service.DismissAlertAsync(h.User.Id, alert.AlertId!.Value, new DismissFraudAlertRequestDto { Password = Password }, "1.1.1.1", CancellationToken.None));
    }

    [Fact]
    public async Task Dismiss_CorrectPassword_ClosesAlertAndLiftsRestriction()
    {
        using var h = new Harness();
        var alert = await h.JohannesburgThenLondonAsync();

        await h.Service.DismissAlertAsync(h.User.Id, alert.AlertId!.Value, new DismissFraudAlertRequestDto { Password = Password }, "1.1.1.1", CancellationToken.None);

        Assert.Equal(FraudAlertStatus.Dismissed, h.Db.FraudAlerts.Single().Status);
        Assert.Null(h.Db.UserSecurityProfiles.Single().QrRestrictedUntil);
        Assert.Contains(h.Db.AuditLogs, a => a.EventType == AuditEventType.FraudAlertDismissed);
    }

    [Fact]
    public async Task Settings_Defaults_WhenNoProfileExists()
    {
        using var h = new Harness();
        h.TrustDevice("home-device");

        var settings = await h.Service.GetSettingsAsync(h.User.Id, CancellationToken.None);

        Assert.True(settings.DeviceVerificationEnabled);
        Assert.True(settings.ImpossibleTravelDetectionEnabled);
        Assert.False(settings.EnhancedVerificationEnabled);
        Assert.Equal(1, settings.TrustedDeviceCount);
    }

    [Fact]
    public async Task Settings_TurningProtectionOn_DoesNotNeedPassword()
    {
        using var h = new Harness();

        var settings = await h.Service.UpdateSettingsAsync(h.User.Id,
            new UpdateSecuritySettingsRequestDto { EnhancedVerificationEnabled = true }, "1.1.1.1", CancellationToken.None);

        Assert.True(settings.EnhancedVerificationEnabled);
        Assert.Contains(h.Db.AuditLogs, a => a.EventType == AuditEventType.SecuritySettingsUpdated);
    }

    [Fact]
    public async Task Settings_TurningProtectionOff_RequiresPassword()
    {
        using var h = new Harness();

        await Assert.ThrowsAsync<StepUpVerificationFailedException>(() =>
            h.Service.UpdateSettingsAsync(h.User.Id, new UpdateSecuritySettingsRequestDto { ImpossibleTravelDetectionEnabled = false }, "1.1.1.1", CancellationToken.None));

        var settings = await h.Service.UpdateSettingsAsync(h.User.Id,
            new UpdateSecuritySettingsRequestDto { ImpossibleTravelDetectionEnabled = false, Password = Password }, "1.1.1.1", CancellationToken.None);

        Assert.False(settings.ImpossibleTravelDetectionEnabled);
    }
}
