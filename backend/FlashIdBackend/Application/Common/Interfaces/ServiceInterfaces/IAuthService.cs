using Application.Features.Auth.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string? deviceToken, string ipAddress, CancellationToken cancellationToken);
    Task<LogoutResponseDto> LogoutAsync(Guid userId, string ipAddress);
    Task<UserProfileDto?> GetCurrentUserAsync(Guid userId);
    Task<LoginResponseDto> VerifyDeviceAsync(VerifyDeviceRequestDto request, string? ipAddress, CancellationToken cancellationToken);
}