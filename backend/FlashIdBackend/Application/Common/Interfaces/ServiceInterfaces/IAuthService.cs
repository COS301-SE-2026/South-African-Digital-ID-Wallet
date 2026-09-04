using Application.Features.Auth.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string? deviceToken, string ipAddress, CancellationToken cancellationToken);
    Task<LogoutResponseDto> LogoutAsync(Guid userId, string ipAddress);
    Task<UserProfileDto?> GetCurrentUserAsync(Guid userId);
    Task<LoginResponseDto> VerifyDeviceAsync(VerifyDeviceRequestDto request, string? existingDeviceToken, string? ipAddress, CancellationToken cancellationToken);
    Task ResendDeviceVerificationOtpAsync(Guid deviceVerificationId, string ipAddress, CancellationToken cancellationToken);
}