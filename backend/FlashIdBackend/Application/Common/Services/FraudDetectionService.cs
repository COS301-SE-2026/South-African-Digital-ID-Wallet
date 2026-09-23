using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Security;
using Application.Features.FraudDetection;
using Application.Features.FraudDetection.DTOs;
using Application.Features.FraudDetection.Exceptions;
using Application.Features.ManageUserAccountCard.DTOs;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Application.Common.Services;

public class FraudDetectionService : IFraudDetectionService
{
    private const int OverviewActivityItems = 5;
    private const int MaxActivityItems = 50;
    private const int MaxAlerts = 50;

    private static readonly List<SecureActionOptionDto> SecureActionOptions =
    [
        new()
        {
            Action = SecureAccountAction.LogOutOtherDevices,
            Title = "Log out of other devices",
            Description = "Ends all active sessions except this device.",
            IsRecommended = true,
        },
        new()
        {
            Action = SecureAccountAction.ResetPassword,
            Title = "Reset your password",
            Description = "Create a new, secure password for your account.",
        },
        new()
        {
            Action = SecureAccountAction.AddExtraVerification,
            Title = "Add extra verification",
            Description = "Other devices must be verified again and QR codes can only be shared from a trusted device.",
        },
    ];

    private readonly IFraudDetectionRepository _repository;
    private readonly IIpGeolocationProvider _ipGeolocationProvider;
    private readonly IDeviceTokenProvider _deviceTokenProvider;
    private readonly IPasswordHashingProvider _passwordHashingProvider;
    private readonly IJwtTokenProvider _jwtTokenProvider;
    private readonly FraudDetectionOptions _options;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<FraudDetectionService> _logger;

    public FraudDetectionService(
        IFraudDetectionRepository repository,
        IIpGeolocationProvider ipGeolocationProvider,
        IDeviceTokenProvider deviceTokenProvider,
        IPasswordHashingProvider passwordHashingProvider,
        IJwtTokenProvider jwtTokenProvider,
        FraudDetectionOptions options,
        TimeProvider timeProvider,
        ILogger<FraudDetectionService> logger)
    {
        _repository = repository;
        _ipGeolocationProvider = ipGeolocationProvider;
        _deviceTokenProvider = deviceTokenProvider;
        _passwordHashingProvider = passwordHashingProvider;
        _jwtTokenProvider = jwtTokenProvider;
        _options = options;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    private DateTime UtcNow => _timeProvider.GetUtcNow().UtcDateTime;

    public async Task<FraudAssessmentResultDto> RecordSecurityEventAsync(SecurityEventContext context, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(context);

        try
        {
            return await AssessAsync(context, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fraud assessment failed for user {UserId}. Continuing without a risk decision.", context.UserId);
            return FraudAssessmentResultDto.NotAssessed();
        }
    }

    public async Task<FraudAssessmentResultDto> AssessQrGenerationAsync(SecurityEventContext context, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(context);
        context.EventType = SecurityEventType.QrGenerated;

        var profile = await _repository.GetProfileAsync(context.UserId, cancellationToken);

        if (profile?.QrRestrictedUntil is { } restrictedUntil && restrictedUntil > UtcNow)
        {
            var openAlert = (await _repository.GetAlertsAsync(context.UserId, FraudAlertStatus.Open, 1, cancellationToken)).FirstOrDefault();

            await AddAuditAsync(context.UserId, null, AuditEventType.QrGenerationBlocked,
                "QR code generation blocked while the account is under a temporary security restriction.",
                context.IpAddress, cancellationToken);
            await _repository.SaveChangesAsync(cancellationToken);

            throw new QrGenerationRestrictedException(QrGenerationRestrictedException.RiskRestriction, AsUtc(restrictedUntil), openAlert?.Id);
        }

        var result = await RecordSecurityEventAsync(context, cancellationToken);

        if (result.RequiresStepUp)
        {
            throw new QrGenerationRestrictedException(QrGenerationRestrictedException.RiskRestriction, result.QrRestrictedUntil, result.AlertId);
        }

        if (profile?.EnhancedVerificationEnabled == true && !result.IsTrustedDevice)
        {
            await AddAuditAsync(context.UserId, null, AuditEventType.QrGenerationBlocked,
                "QR code generation blocked: extra verification requires a trusted device.",
                context.IpAddress, cancellationToken);
            await _repository.SaveChangesAsync(cancellationToken);

            throw new QrGenerationRestrictedException(QrGenerationRestrictedException.TrustedDeviceRequired, null, null);
        }

        return result;
    }

    private async Task<FraudAssessmentResultDto> AssessAsync(SecurityEventContext context, CancellationToken cancellationToken)
    {
        var now = UtcNow;
        var since = now - _options.LookbackWindow;

        var profile = await _repository.GetOrCreateProfileAsync(context.UserId, cancellationToken);
        var location = await ResolveLocationAsync(context, cancellationToken);

        var deviceTokenHash = string.IsNullOrWhiteSpace(context.DeviceToken)
            ? null
            : _deviceTokenProvider.HashToken(context.DeviceToken);

        var trustedDevice = deviceTokenHash is null
            ? null
            : await _repository.GetTrustedDeviceAsync(context.UserId, deviceTokenHash, cancellationToken);

        var seenBefore = deviceTokenHash is not null &&
                         await _repository.HasSeenDeviceAsync(context.UserId, deviceTokenHash, cancellationToken);

        var isNewDevice = deviceTokenHash is not null && !seenBefore &&
                          (trustedDevice is null || trustedDevice.CreatedAt >= now - _options.NewDeviceGracePeriod);

        SecurityEvent? previous = null;
        TravelAnalysis? travel = null;

        if (profile.ImpossibleTravelDetectionEnabled)
        {
            previous = await _repository.GetLatestLocatedEventAsync(context.UserId, since, cancellationToken);

            if (previous is not null && location.HasCoordinates)
            {
                travel = ImpossibleTravelAnalyzer.Analyze(
                    previous.Latitude!.Value, previous.Longitude!.Value, previous.OccurredAt,
                    location.Latitude!.Value, location.Longitude!.Value, now,
                    _options);
            }
        }

        var failedLogins = await _repository.CountFailedLoginsSinceAsync(context.UserId, since, cancellationToken);

        var evaluation = FraudRiskScorer.Evaluate(new FraudRiskInput
        {
            Travel = travel,
            PreviousCountry = previous?.Country,
            CurrentCountry = profile.ImpossibleTravelDetectionEnabled ? location.Country : null,
            IsNewDevice = isNewDevice,
            IsTrustedDevice = trustedDevice is not null,
            RecentFailedLogins = failedLogins,
            IsSensitiveAction = context.EventType == SecurityEventType.QrGenerated,
        }, _options);

        var deviceDescription = trustedDevice is not null && !string.IsNullOrWhiteSpace(trustedDevice.DeviceName)
            ? trustedDevice.DeviceName
            : UserAgentDescriber.Describe(context.UserAgent);

        var securityEvent = new SecurityEvent
        {
            Id = Guid.NewGuid(),
            UserId = context.UserId,
            EventType = context.EventType,
            OccurredAt = now,
            IpAddress = Truncate(string.IsNullOrWhiteSpace(context.IpAddress) ? "unknown" : context.IpAddress, 45)!,
            City = Truncate(location.City, 100),
            Country = Truncate(location.Country, 100),
            Latitude = location.Latitude,
            Longitude = location.Longitude,
            DeviceTokenHash = deviceTokenHash,
            DeviceDescription = Truncate(deviceDescription, 150)!,
            IsTrustedDevice = trustedDevice is not null,
            IsNewDevice = isNewDevice,
            RiskScore = evaluation.Score,
            RiskLevel = evaluation.Level,
            CreatedAt = now,
            UpdatedAt = now,
        };

        await _repository.AddSecurityEventAsync(securityEvent, cancellationToken);

        var result = new FraudAssessmentResultDto
        {
            Assessed = true,
            SecurityEventId = securityEvent.Id,
            RiskScore = evaluation.Score,
            RiskLevel = evaluation.Level,
            Signals = evaluation.Signals.Select(s => s.Code).ToList(),
            IsTrustedDevice = securityEvent.IsTrustedDevice,
            IsNewDevice = isNewDevice,
            DistanceKm = travel?.DistanceKm,
            ImpliedSpeedKmh = travel?.ImpliedSpeedKmh,
        };

        if (evaluation.Level >= FraudRiskLevel.Medium)
        {
            var isImpossibleTravel = evaluation.Has(FraudSignals.ImpossibleTravel);
            var correlatedEvent = travel is not null ? previous : null;

            var alert = new FraudAlert
            {
                Id = Guid.NewGuid(),
                UserId = context.UserId,
                SecurityEventId = securityEvent.Id,
                PreviousSecurityEventId = correlatedEvent?.Id,
                RiskScore = evaluation.Score,
                RiskLevel = evaluation.Level,
                Status = FraudAlertStatus.Open,
                Signals = FraudSignals.Serialize(evaluation.Signals),
                IsImpossibleTravel = isImpossibleTravel,
                DistanceKm = travel?.DistanceKm,
                ElapsedMinutes = travel?.ElapsedMinutes,
                ImpliedSpeedKmh = travel?.ImpliedSpeedKmh,
                CreatedAt = now,
                UpdatedAt = now,
            };

            await _repository.AddFraudAlertAsync(alert, cancellationToken);

            if (evaluation.Level == FraudRiskLevel.High)
            {
                profile.QrRestrictedUntil = now + _options.QrRestrictionDuration;
                profile.UpdatedAt = now;
                result.RequiresStepUp = true;
                result.QrRestrictedUntil = profile.QrRestrictedUntil;
            }

            var title = BuildAlertTitle(isImpossibleTravel);
            var message = BuildAlertMessage(securityEvent, correlatedEvent, isImpossibleTravel);
            var citizenId = await _repository.GetCitizenIdByUserIdAsync(context.UserId, cancellationToken);

            if (citizenId is not null)
            {
                await _repository.AddNotificationAsync(new Notification
                {
                    Id = Guid.NewGuid(),
                    CitizenId = citizenId.Value,
                    Title = $"Security alert: {title}",
                    Description = $"{message} Open Security to review this activity.",
                    Tone = "warning",
                    CreatedAt = now,
                    IsRead = false,
                }, cancellationToken);
            }

            await AddAuditAsync(context.UserId, citizenId,
                isImpossibleTravel ? AuditEventType.ImpossibleTravelDetected : AuditEventType.SuspiciousActivityDetected,
                $"{title}: risk score {evaluation.Score} ({evaluation.Level}). Signals: {string.Join(", ", result.Signals)}.",
                context.IpAddress, cancellationToken);

            if (evaluation.Level == FraudRiskLevel.High)
            {
                await AddAuditAsync(context.UserId, citizenId, AuditEventType.QrGenerationRestricted,
                    $"QR code generation restricted until {profile.QrRestrictedUntil:u} after a high-risk security event.",
                    context.IpAddress, cancellationToken);
            }

            result.AlertId = alert.Id;
            result.Notice = new SecurityAlertNoticeDto
            {
                AlertId = alert.Id,
                Title = title,
                Message = message,
                RiskLevel = evaluation.Level,
                RiskScore = evaluation.Score,
                Location = LocationLabel(securityEvent.City, securityEvent.Country),
                OccurredAt = now,
                DeviceDescription = securityEvent.DeviceDescription,
                QrGenerationRestricted = result.RequiresStepUp,
                QrRestrictedUntil = result.QrRestrictedUntil,
            };
        }

        await _repository.SaveChangesAsync(cancellationToken);
        return result;
    }

    public async Task<SecurityOverviewDto> GetSecurityOverviewAsync(Guid userId, CancellationToken cancellationToken)
    {
        var profile = await _repository.GetProfileAsync(userId, cancellationToken);
        var latestOpen = await _repository.GetAlertsAsync(userId, FraudAlertStatus.Open, 1, cancellationToken);
        var openCount = await _repository.CountAlertsAsync(userId, FraudAlertStatus.Open, cancellationToken);
        var events = await _repository.GetRecentEventsAsync(userId, OverviewActivityItems, cancellationToken);
        var restrictedUntil = ActiveRestriction(profile);

        return new SecurityOverviewDto
        {
            HasActiveAlert = openCount > 0,
            ActiveAlertCount = openCount,
            LatestAlert = latestOpen.Select(a => FillSummary(new FraudAlertSummaryDto(), a)).FirstOrDefault(),
            QrGenerationRestricted = restrictedUntil.HasValue,
            QrRestrictedUntil = restrictedUntil,
            RecentActivity = events.Select(ToActivityItem).ToList(),
        };
    }

    public async Task<List<SecurityActivityItemDto>> GetActivityAsync(Guid userId, int limit, CancellationToken cancellationToken)
    {
        var take = Math.Clamp(limit, 1, MaxActivityItems);
        var events = await _repository.GetRecentEventsAsync(userId, take, cancellationToken);
        return events.Select(ToActivityItem).ToList();
    }

    public async Task<List<FraudAlertSummaryDto>> GetAlertsAsync(Guid userId, FraudAlertStatus? status, CancellationToken cancellationToken)
    {
        var alerts = await _repository.GetAlertsAsync(userId, status, MaxAlerts, cancellationToken);
        return alerts.Select(a => FillSummary(new FraudAlertSummaryDto(), a)).ToList();
    }

    public async Task<FraudAlertDetailsDto> GetAlertDetailsAsync(Guid userId, Guid alertId, CancellationToken cancellationToken)
    {
        var alert = await _repository.GetAlertAsync(userId, alertId, cancellationToken)
                    ?? throw new FraudAlertNotFoundException(alertId);

        var evt = alert.SecurityEvent;
        var details = FillSummary(new FraudAlertDetailsDto(), alert);

        details.IpAddress = evt.IpAddress;
        details.DeviceDescription = evt.DeviceDescription;
        details.IsNewDevice = evt.IsNewDevice;
        details.IsTrustedDevice = evt.IsTrustedDevice;
        details.DistanceKm = alert.DistanceKm;
        details.ElapsedMinutes = alert.ElapsedMinutes;
        details.ImpliedSpeedKmh = alert.ImpliedSpeedKmh;
        details.SuspiciousLocation = ToLocation(evt);
        details.PreviousLocation = alert.PreviousSecurityEvent is null ? null : ToLocation(alert.PreviousSecurityEvent);
        details.Signals = FraudSignals.Deserialize(alert.Signals)
            .Select(s => new FraudSignalDto { Code = s.Code, Description = FraudSignals.Describe(s.Code), Weight = s.Weight })
            .ToList();
        details.AvailableActions = alert.Status == FraudAlertStatus.Open
            ? SecureActionOptions.Select(o => new SecureActionOptionDto
            {
                Action = o.Action,
                Title = o.Title,
                Description = o.Description,
                IsRecommended = o.IsRecommended,
            }).ToList()
            : new List<SecureActionOptionDto>();
        details.ResolvedAt = alert.ResolvedAt.HasValue ? AsUtc(alert.ResolvedAt.Value) : null;
        details.ResolutionAction = alert.ResolutionAction;

        return details;
    }

    public async Task<SecureAccountResultDto> SecureAccountAsync(Guid userId, Guid alertId, SecureAccountRequestDto request,
        string? currentDeviceToken, string ipAddress, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (!Enum.IsDefined(request.Action))
        {
            throw new ArgumentOutOfRangeException(nameof(request), "Unsupported security action.");
        }

        var alert = await GetOpenAlertAsync(userId, alertId, cancellationToken);
        var user = await _repository.GetUserByIdAsync(userId, cancellationToken)
                   ?? throw new FraudAlertNotFoundException(alertId);
        var profile = await _repository.GetOrCreateProfileAsync(userId, cancellationToken);

        var now = UtcNow;
        var currentHash = string.IsNullOrWhiteSpace(currentDeviceToken)
            ? null
            : _deviceTokenProvider.HashToken(currentDeviceToken);

        int devicesRemoved;
        if (request.Action == SecureAccountAction.AddExtraVerification)
        {
            devicesRemoved = await _repository.RemoveTrustedDevicesExceptAsync(userId, currentHash, cancellationToken);
            profile.EnhancedVerificationEnabled = true;
        }
        else
        {
            var suspiciousHash = alert.SecurityEvent.DeviceTokenHash;
            devicesRemoved = suspiciousHash is not null && suspiciousHash != currentHash
                ? await _repository.RemoveTrustedDeviceAsync(userId, suspiciousHash, cancellationToken)
                : 0;
        }

        user.TokenVersion++;
        user.UpdatedAt = now;

        profile.QrRestrictedUntil = null;
        profile.UpdatedAt = now;

        alert.Status = FraudAlertStatus.Secured;
        alert.ResolvedAt = now;
        alert.ResolutionAction = request.Action;
        alert.UpdatedAt = now;

        await AddAuditAsync(userId, null, AuditEventType.FraudAlertSecured,
            $"Security alert {alert.Id} secured with action {request.Action}. {devicesRemoved} device(s) removed and other sessions revoked.",
            ipAddress, cancellationToken);

        await _repository.SaveChangesAsync(cancellationToken);

        var (token, expiresAt) = _jwtTokenProvider.GenerateToken(user);

        return BuildSecureResult(alert.Id, request.Action, devicesRemoved, token, expiresAt);
    }

    public async Task DismissAlertAsync(Guid userId, Guid alertId, DismissFraudAlertRequestDto request, string ipAddress,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var alert = await GetOpenAlertAsync(userId, alertId, cancellationToken);
        await VerifyStepUpPasswordAsync(userId, request.Password, ipAddress, cancellationToken);

        var now = UtcNow;
        var profile = await _repository.GetOrCreateProfileAsync(userId, cancellationToken);
        profile.QrRestrictedUntil = null;
        profile.UpdatedAt = now;

        alert.Status = FraudAlertStatus.Dismissed;
        alert.ResolvedAt = now;
        alert.UpdatedAt = now;

        await AddAuditAsync(userId, null, AuditEventType.FraudAlertDismissed,
            $"Security alert {alert.Id} confirmed as legitimate activity by the citizen after password step-up.",
            ipAddress, cancellationToken);

        await _repository.SaveChangesAsync(cancellationToken);
    }

    public async Task<SecuritySettingsDto> GetSettingsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var profile = await _repository.GetProfileAsync(userId, cancellationToken);
        return await BuildSettingsAsync(userId, profile, cancellationToken);
    }

    public async Task<SecuritySettingsDto> UpdateSettingsAsync(Guid userId, UpdateSecuritySettingsRequestDto request, string ipAddress,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var profile = await _repository.GetOrCreateProfileAsync(userId, cancellationToken);

        var weakensProtection =
            (request.ImpossibleTravelDetectionEnabled == false && profile.ImpossibleTravelDetectionEnabled) ||
            (request.EnhancedVerificationEnabled == false && profile.EnhancedVerificationEnabled);

        if (weakensProtection)
        {
            await VerifyStepUpPasswordAsync(userId, request.Password, ipAddress, cancellationToken);
        }

        if (request.ImpossibleTravelDetectionEnabled.HasValue)
        {
            profile.ImpossibleTravelDetectionEnabled = request.ImpossibleTravelDetectionEnabled.Value;
        }

        if (request.EnhancedVerificationEnabled.HasValue)
        {
            profile.EnhancedVerificationEnabled = request.EnhancedVerificationEnabled.Value;
        }

        profile.UpdatedAt = UtcNow;

        await AddAuditAsync(userId, null, AuditEventType.SecuritySettingsUpdated,
            $"Security settings updated: impossible-travel detection {(profile.ImpossibleTravelDetectionEnabled ? "on" : "off")}, extra verification {(profile.EnhancedVerificationEnabled ? "on" : "off")}.",
            ipAddress, cancellationToken);

        await _repository.SaveChangesAsync(cancellationToken);

        return await BuildSettingsAsync(userId, profile, cancellationToken);
    }

    private async Task<SecuritySettingsDto> BuildSettingsAsync(Guid userId, UserSecurityProfile? profile, CancellationToken cancellationToken)
    {
        var restrictedUntil = ActiveRestriction(profile);

        return new SecuritySettingsDto
        {
            DeviceVerificationEnabled = true,
            ImpossibleTravelDetectionEnabled = profile?.ImpossibleTravelDetectionEnabled ?? true,
            EnhancedVerificationEnabled = profile?.EnhancedVerificationEnabled ?? false,
            TrustedDeviceCount = await _repository.CountTrustedDevicesAsync(userId, cancellationToken),
            QrGenerationRestricted = restrictedUntil.HasValue,
            QrRestrictedUntil = restrictedUntil,
        };
    }

    private async Task<FraudAlert> GetOpenAlertAsync(Guid userId, Guid alertId, CancellationToken cancellationToken)
    {
        var alert = await _repository.GetAlertAsync(userId, alertId, cancellationToken)
                    ?? throw new FraudAlertNotFoundException(alertId);

        if (alert.Status != FraudAlertStatus.Open)
        {
            throw new FraudAlertAlreadyResolvedException(alert.Status);
        }

        return alert;
    }

    private async Task VerifyStepUpPasswordAsync(Guid userId, string? password, string ipAddress, CancellationToken cancellationToken)
    {
        var user = await _repository.GetUserByIdAsync(userId, cancellationToken);

        if (user is null || user.IsDeleted || (user.LockoutUntil.HasValue && user.LockoutUntil > UtcNow))
        {
            throw new StepUpVerificationFailedException();
        }

        if (string.IsNullOrWhiteSpace(password) || !_passwordHashingProvider.VerifyPassword(password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutUntil = UtcNow.AddMinutes(30);
            }

            await AddAuditAsync(userId, null, AuditEventType.FailedLoginAttempt,
                "Failed password step-up while reviewing a security alert.", ipAddress, cancellationToken);
            await _repository.SaveChangesAsync(cancellationToken);

            throw new StepUpVerificationFailedException();
        }

        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;
    }

    private async Task<ResolvedLocation> ResolveLocationAsync(SecurityEventContext context, CancellationToken cancellationToken)
    {
        IpLocationResult? ipLocation = null;

        if (IpAddressClassifier.IsPublic(context.IpAddress))
        {
            try
            {
                ipLocation = await _ipGeolocationProvider.GetLocationAsync(context.IpAddress, cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "IP geolocation lookup failed during fraud assessment. Continuing without IP location.");
            }
        }

        var latitude = ipLocation?.Latitude;
        var longitude = ipLocation?.Longitude;

        if (!GeoDistance.IsValidCoordinate(latitude, longitude) &&
            KnownLocations.TryGetCoordinates(ipLocation?.City, out var knownLatitude, out var knownLongitude))
        {
            latitude = knownLatitude;
            longitude = knownLongitude;
        }

        if (ipLocation is not null && GeoDistance.IsValidCoordinate(latitude, longitude))
        {
            return new ResolvedLocation(ipLocation.City, ipLocation.Country, latitude, longitude);
        }

        if (GeoDistance.IsValidCoordinate(context.ClientLatitude, context.ClientLongitude))
        {
            return new ResolvedLocation(
                context.ClientCity ?? ipLocation?.City,
                context.ClientCountry ?? ipLocation?.Country,
                context.ClientLatitude,
                context.ClientLongitude);
        }

        if (KnownLocations.TryGetCoordinates(context.ClientCity, out knownLatitude, out knownLongitude))
        {
            return new ResolvedLocation(context.ClientCity, context.ClientCountry, knownLatitude, knownLongitude);
        }

        return new ResolvedLocation(ipLocation?.City ?? context.ClientCity, ipLocation?.Country ?? context.ClientCountry, null, null);
    }

    private async Task AddAuditAsync(Guid userId, Guid? citizenId, AuditEventType eventType, string details, string? ipAddress,
        CancellationToken cancellationToken)
    {
        await _repository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = eventType,
            Details = details,
            IpAddress = Truncate(string.IsNullOrWhiteSpace(ipAddress) ? "unknown" : ipAddress, 45),
            ActorId = userId,
            CitizenId = citizenId,
            CreatedAt = UtcNow,
        }, cancellationToken);
    }

    private static SecureAccountResultDto BuildSecureResult(Guid alertId, SecureAccountAction action, int devicesRemoved, string token, DateTime expiresAt)
    {
        const string monitoring = "We'll keep monitoring your account for any further suspicious activity.";
        const string manage = "You can manage your security settings anytime in the Security section.";

        var result = new SecureAccountResultDto
        {
            AlertId = alertId,
            Action = action,
            Title = "Your account is secured",
            DevicesRemoved = devicesRemoved,
            Token = token,
            ExpiresAt = expiresAt,
        };

        switch (action)
        {
            case SecureAccountAction.ResetPassword:
                result.Message = "We've logged you out of other devices. Create a new password to finish securing your account.";
                result.RequiresPasswordChange = true;
                result.NextSteps = ["Create a new, secure password now.", "You'll need to log in again on other devices.", monitoring];
                break;
            case SecureAccountAction.AddExtraVerification:
                result.Message = "Extra verification is now on. Other devices must verify with a one-time code before they can be used again.";
                result.NextSteps = ["Other devices must be verified again with an email code.", "QR codes can only be generated from a trusted device.", manage];
                break;
            default:
                result.Message = "We've logged you out of other devices and kept your account safe.";
                result.NextSteps = ["You'll need to log in again on other devices.", monitoring, manage];
                break;
        }

        return result;
    }

    private static T FillSummary<T>(T dto, FraudAlert alert) where T : FraudAlertSummaryDto
    {
        dto.Id = alert.Id;
        dto.Title = BuildAlertTitle(alert.IsImpossibleTravel);
        dto.Message = BuildAlertMessage(alert.SecurityEvent, alert.PreviousSecurityEvent, alert.IsImpossibleTravel);
        dto.RiskScore = alert.RiskScore;
        dto.RiskLevel = alert.RiskLevel;
        dto.Status = alert.Status;
        dto.IsImpossibleTravel = alert.IsImpossibleTravel;
        dto.EventType = alert.SecurityEvent.EventType;
        dto.DetectedAt = AsUtc(alert.CreatedAt);
        dto.PreviousLocationLabel = alert.PreviousSecurityEvent is null
            ? null
            : LocationLabel(alert.PreviousSecurityEvent.City, alert.PreviousSecurityEvent.Country);
        dto.SuspiciousLocationLabel = LocationLabel(alert.SecurityEvent.City, alert.SecurityEvent.Country);
        return dto;
    }

    private static SecurityActivityItemDto ToActivityItem(SecurityEvent evt) => new()
    {
        Id = evt.Id,
        EventType = evt.EventType,
        Title = evt.EventType switch
        {
            SecurityEventType.DeviceVerified => "New device registered",
            SecurityEventType.QrGenerated => "QR code generated",
            _ => "Signed in",
        },
        LocationLabel = LocationLabel(evt.City, evt.Country),
        OccurredAt = AsUtc(evt.OccurredAt),
        DeviceDescription = evt.DeviceDescription,
        IsTrustedDevice = evt.IsTrustedDevice,
        RiskScore = evt.RiskScore,
        RiskLevel = evt.RiskLevel,
        IsSuspicious = evt.RiskLevel >= FraudRiskLevel.Medium,
    };

    private static SecurityLocationDto ToLocation(SecurityEvent evt) => new()
    {
        City = evt.City,
        Country = evt.Country,
        Latitude = evt.Latitude,
        Longitude = evt.Longitude,
        Label = LocationLabel(evt.City, evt.Country),
        OccurredAt = AsUtc(evt.OccurredAt),
    };

    private static string BuildAlertTitle(bool isImpossibleTravel) =>
        isImpossibleTravel ? "Possible impossible travel" : "Unusual security activity";

    private static string BuildAlertMessage(SecurityEvent current, SecurityEvent? previous, bool isImpossibleTravel)
    {
        var action = current.EventType switch
        {
            SecurityEventType.DeviceVerified => "new device sign-in",
            SecurityEventType.QrGenerated => "QR code request",
            _ => "sign-in",
        };
        var where = LocationLabel(current.City, current.Country);

        return isImpossibleTravel && previous is not null
            ? $"We detected a {action} from {where} that is unlikely based on your recent activity in {LocationLabel(previous.City, previous.Country)}."
            : $"We detected a {action} from {where} that doesn't match your usual activity.";
    }

    private static string LocationLabel(string? city, string? country)
    {
        var parts = new[] { city, country }.Where(p => !string.IsNullOrWhiteSpace(p)).ToArray();
        return parts.Length == 0 ? "an unknown location" : string.Join(", ", parts);
    }

    private DateTime? ActiveRestriction(UserSecurityProfile? profile) =>
        profile?.QrRestrictedUntil is { } until && until > UtcNow ? AsUtc(until) : null;

    private static DateTime AsUtc(DateTime value) => DateTime.SpecifyKind(value, DateTimeKind.Utc);

    private static string? Truncate(string? value, int maxLength) =>
        value is null || value.Length <= maxLength ? value : value[..maxLength];

    private sealed record ResolvedLocation(string? City, string? Country, double? Latitude, double? Longitude)
    {
        public bool HasCoordinates => GeoDistance.IsValidCoordinate(Latitude, Longitude);
    }
}
