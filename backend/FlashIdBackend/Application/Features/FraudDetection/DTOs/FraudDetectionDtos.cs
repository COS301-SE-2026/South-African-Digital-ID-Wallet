using System.Text.Json.Serialization;
using Domain.Enums;

namespace Application.Features.FraudDetection.DTOs;

public class SecurityEventContext
{
    public Guid UserId { get; set; }
    public SecurityEventType EventType { get; set; }
    public string IpAddress { get; set; } = "unknown";
    public string? DeviceToken { get; set; }
    public string? UserAgent { get; set; }

    public double? ClientLatitude { get; set; }
    public double? ClientLongitude { get; set; }
    public string? ClientCity { get; set; }
    public string? ClientCountry { get; set; }
}

public class SecurityLocationDto
{
    public string? City { get; set; }
    public string? Country { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string Label { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
}

public class FraudSignalDto
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Weight { get; set; }
}

public class SecureActionOptionDto
{
    public SecureAccountAction Action { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsRecommended { get; set; }
}

public class SecurityAlertNoticeDto
{
    public Guid AlertId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public FraudRiskLevel RiskLevel { get; set; }
    public int RiskScore { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
    public string DeviceDescription { get; set; } = string.Empty;
    public bool QrGenerationRestricted { get; set; }
    public DateTime? QrRestrictedUntil { get; set; }
}

public class FraudAssessmentResultDto
{
    public bool Assessed { get; set; }
    public Guid? SecurityEventId { get; set; }
    public int RiskScore { get; set; }
    public FraudRiskLevel RiskLevel { get; set; }
    public List<string> Signals { get; set; } = new();
    public bool IsTrustedDevice { get; set; }
    public bool IsNewDevice { get; set; }
    public double? DistanceKm { get; set; }
    public double? ImpliedSpeedKmh { get; set; }
    public Guid? AlertId { get; set; }
    public bool RequiresStepUp { get; set; }
    public DateTime? QrRestrictedUntil { get; set; }
    public SecurityAlertNoticeDto? Notice { get; set; }

    public static FraudAssessmentResultDto NotAssessed() => new()
    {
        Assessed = false,
        RiskLevel = FraudRiskLevel.Low,
    };
}

public class FraudAlertSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public FraudRiskLevel RiskLevel { get; set; }
    public FraudAlertStatus Status { get; set; }
    public bool IsImpossibleTravel { get; set; }
    public SecurityEventType EventType { get; set; }
    public DateTime DetectedAt { get; set; }
    public string? PreviousLocationLabel { get; set; }
    public string SuspiciousLocationLabel { get; set; } = string.Empty;
}

public class FraudAlertDetailsDto : FraudAlertSummaryDto
{
    public string IpAddress { get; set; } = string.Empty;
    public string DeviceDescription { get; set; } = string.Empty;
    public bool IsNewDevice { get; set; }
    public bool IsTrustedDevice { get; set; }
    public double? DistanceKm { get; set; }
    public double? ElapsedMinutes { get; set; }
    public double? ImpliedSpeedKmh { get; set; }
    public SecurityLocationDto? PreviousLocation { get; set; }
    public SecurityLocationDto SuspiciousLocation { get; set; } = new();
    public List<FraudSignalDto> Signals { get; set; } = new();
    public List<SecureActionOptionDto> AvailableActions { get; set; } = new();
    public DateTime? ResolvedAt { get; set; }
    public SecureAccountAction? ResolutionAction { get; set; }
}

public class SecurityActivityItemDto
{
    public Guid Id { get; set; }
    public SecurityEventType EventType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string LocationLabel { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
    public string DeviceDescription { get; set; } = string.Empty;
    public bool IsTrustedDevice { get; set; }
    public int RiskScore { get; set; }
    public FraudRiskLevel RiskLevel { get; set; }
    public bool IsSuspicious { get; set; }
}

public class SecurityOverviewDto
{
    public bool HasActiveAlert { get; set; }
    public int ActiveAlertCount { get; set; }
    public FraudAlertSummaryDto? LatestAlert { get; set; }
    public bool QrGenerationRestricted { get; set; }
    public DateTime? QrRestrictedUntil { get; set; }
    public List<SecurityActivityItemDto> RecentActivity { get; set; } = new();
}

public class SecureAccountRequestDto
{
    public SecureAccountAction Action { get; set; }
    public string Password { get; set; } = string.Empty;
}

public class SecureAccountResultDto
{
    public Guid AlertId { get; set; }
    public SecureAccountAction Action { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public List<string> NextSteps { get; set; } = new();
    public int DevicesRemoved { get; set; }
    public bool RequiresPasswordChange { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Token { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public DateTime? ExpiresAt { get; set; }
}

public class DismissFraudAlertRequestDto
{
    public string Password { get; set; } = string.Empty;
}

public class SecuritySettingsDto
{
    public bool DeviceVerificationEnabled { get; set; } = true;
    public bool EnhancedVerificationEnabled { get; set; }
    public bool ImpossibleTravelDetectionEnabled { get; set; }
    public int TrustedDeviceCount { get; set; }
    public bool QrGenerationRestricted { get; set; }
    public DateTime? QrRestrictedUntil { get; set; }
}

public class UpdateSecuritySettingsRequestDto
{
    public bool? ImpossibleTravelDetectionEnabled { get; set; }
    public bool? EnhancedVerificationEnabled { get; set; }

    public string? Password { get; set; }
}

public class SimulateSecurityEventRequestDto
{
    public SecurityEventType EventType { get; set; } = SecurityEventType.Login;
    public string? City { get; set; }
    public string? Country { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? DeviceToken { get; set; }
}
