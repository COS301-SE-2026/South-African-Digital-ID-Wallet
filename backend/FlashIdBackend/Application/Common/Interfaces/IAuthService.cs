using Application.Features.Auth.DTOs;

namespace Application.Common.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string ipAddress);
    Task<LogoutResponseDto> LogoutAsync(Guid userId, string ipAddress);
}