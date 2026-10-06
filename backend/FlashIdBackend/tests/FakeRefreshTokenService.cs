using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Auth.DTOs;
using Domain.Entities;

namespace tests;

internal sealed class FakeRefreshTokenService : IRefreshTokenService
{
    public List<(Guid UserId, bool RememberMe)> Issued { get; } = new();

    public Task<IssuedRefreshToken> IssueAsync(User user, bool rememberMe, CancellationToken cancellationToken)
    {
        Issued.Add((user.Id, rememberMe));
        return Task.FromResult(new IssuedRefreshToken("fake-refresh-token", DateTime.UtcNow.AddDays(rememberMe ? 30 : 1)));
    }

    public Task<IssuedRefreshToken> ReissueAsync(Guid userId, string? currentRefreshToken, bool fallbackRememberMe, CancellationToken cancellationToken) =>
        Task.FromResult(new IssuedRefreshToken("fake-refresh-token", DateTime.UtcNow.AddDays(30)));

    public Task<LoginResponseDto> RefreshAsync(string? refreshToken, CancellationToken cancellationToken) =>
        throw new UnauthorizedAccessException("Not supported by the fake.");

    public Task RevokeAsync(Guid userId, string? refreshToken, CancellationToken cancellationToken) => Task.CompletedTask;
}
