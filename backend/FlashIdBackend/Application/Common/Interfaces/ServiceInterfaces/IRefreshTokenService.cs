using Application.Features.Auth.DTOs;
using Domain.Entities;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IRefreshTokenService
{
    Task<IssuedRefreshToken> IssueAsync(User user, bool rememberMe, CancellationToken cancellationToken);
    Task<IssuedRefreshToken> ReissueAsync(Guid userId, string? currentRefreshToken, bool fallbackRememberMe, CancellationToken cancellationToken);
    Task<LoginResponseDto> RefreshAsync(string? refreshToken, CancellationToken cancellationToken);
    Task RevokeAsync(Guid userId, string? refreshToken, CancellationToken cancellationToken);
}
