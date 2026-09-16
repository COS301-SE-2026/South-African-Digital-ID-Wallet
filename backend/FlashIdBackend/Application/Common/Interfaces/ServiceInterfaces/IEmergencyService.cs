using Application.Features.Emergency.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IEmergencyService
{
    Task<EmergencyProfileResponseDto> ResolveAsync(
        ResolveEmergencyRequestDto request, Guid responderUserId, string ipAddress, CancellationToken ct);

    Task<RegisterEmergencyDeviceResponseDto> RegisterDeviceAsync(
        RegisterEmergencyDeviceRequestDto request, Guid userId, CancellationToken ct);

    Task<EmergencyProfileDto> GetMyProfileAsync(Guid userId, CancellationToken ct);
    Task<EmergencyProfileDto> SaveProfileAsync(
        SaveEmergencyProfileRequestDto request, Guid userId, CancellationToken ct);

    Task<OfflineCredentialResponseDto> BuildOfflineCredentialAsync(Guid userId, CancellationToken ct);
    Task<List<EmergencyAccessDto>> GetMyAccessHistoryAsync(Guid userId, CancellationToken ct);
}