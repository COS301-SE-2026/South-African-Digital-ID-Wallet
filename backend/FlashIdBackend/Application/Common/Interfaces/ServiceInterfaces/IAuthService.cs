using Application.Features.Auth.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string? deviceToken, string ipAddress, CancellationToken cancellationToken);
    Task<LogoutResponseDto> LogoutAsync(Guid userId, string ipAddress);
    // Returns null if the user does not exist, so the controller can return 404.
    Task<UserProfileDto?> GetCurrentUserAsync(Guid userId);
}