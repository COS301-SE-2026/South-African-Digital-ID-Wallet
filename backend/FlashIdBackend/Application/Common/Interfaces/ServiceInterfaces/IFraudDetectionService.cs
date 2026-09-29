using Application.Features.FraudDetection.DTOs;
using Domain.Enums;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IFraudDetectionService
{
    Task<FraudAssessmentResultDto> RecordSecurityEventAsync(SecurityEventContext context, CancellationToken cancellationToken);
    Task EnsureQrGenerationAllowedAsync(SecurityEventContext context, CancellationToken cancellationToken);
    Task<FraudAssessmentResultDto> RecordQrGenerationAsync(SecurityEventContext context, CancellationToken cancellationToken);
    Task<SecurityOverviewDto> GetSecurityOverviewAsync(Guid userId, CancellationToken cancellationToken);
    Task<List<SecurityActivityItemDto>> GetActivityAsync(Guid userId, int limit, CancellationToken cancellationToken);
    Task<List<FraudAlertSummaryDto>> GetAlertsAsync(Guid userId, FraudAlertStatus? status, CancellationToken cancellationToken);
    Task<FraudAlertDetailsDto> GetAlertDetailsAsync(Guid userId, Guid alertId, CancellationToken cancellationToken);
    Task<SecureAccountResultDto> SecureAccountAsync(Guid userId, Guid alertId, SecureAccountRequestDto request, string? currentDeviceToken, string ipAddress, CancellationToken cancellationToken);
    Task DismissAlertAsync(Guid userId, Guid alertId, DismissFraudAlertRequestDto request, string ipAddress, CancellationToken cancellationToken);
    Task<SecuritySettingsDto> GetSettingsAsync(Guid userId, CancellationToken cancellationToken);
    Task<SecuritySettingsDto> UpdateSettingsAsync(Guid userId, UpdateSecuritySettingsRequestDto request, string ipAddress, CancellationToken cancellationToken);
}
