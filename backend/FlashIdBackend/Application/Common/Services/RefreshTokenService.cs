using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Auth.DTOs;
using Application.Features.Auth.Exceptions;
using Domain.Entities;

namespace Application.Common.Services;

public class RefreshTokenService : IRefreshTokenService
{
    private static readonly TimeSpan RememberedLifetime = TimeSpan.FromDays(30);
    private static readonly TimeSpan SessionLifetime = TimeSpan.FromHours(8);
    private static readonly TimeSpan ConcurrentRefreshGrace = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan RevokedRetention = TimeSpan.FromDays(7);

    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IAuthRepository _authRepository;
    private readonly IJwtTokenProvider _jwtTokenProvider;

    public RefreshTokenService(
        IRefreshTokenRepository refreshTokenRepository,
        IAuthRepository authRepository,
        IJwtTokenProvider jwtTokenProvider)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _authRepository = authRepository;
        _jwtTokenProvider = jwtTokenProvider;
    }

    public async Task<IssuedRefreshToken> IssueAsync(User user, bool rememberMe, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        await _refreshTokenRepository.RemoveStaleAsync(user.Id, now, now - RevokedRetention, cancellationToken);
        var (_, issued) = await AddTokenAsync(user, Guid.NewGuid(), rememberMe, now, cancellationToken);
        await _refreshTokenRepository.SaveChangesAsync(cancellationToken);
        return issued;
    }

    public async Task<IssuedRefreshToken> ReissueAsync(Guid userId, string? currentRefreshToken, bool fallbackRememberMe,
        CancellationToken cancellationToken)
    {
        var user = await _authRepository.GetUserByIdAsync(userId)
                   ?? throw new UnauthorizedAccessException("The user account could not be found.");

        var current = string.IsNullOrWhiteSpace(currentRefreshToken)
            ? null
            : await _refreshTokenRepository.GetByHashAsync(HashToken(currentRefreshToken), cancellationToken);

        if (current is null || current.UserId != userId)
        {
            return await IssueAsync(user, fallbackRememberMe, cancellationToken);
        }

        var now = DateTime.UtcNow;
        await _refreshTokenRepository.RevokeFamilyAsync(current.FamilyId, now, cancellationToken);
        var (_, issued) = await AddTokenAsync(user, current.FamilyId, current.RememberMe, now, cancellationToken);
        await _refreshTokenRepository.SaveChangesAsync(cancellationToken);
        return issued;
    }

    public async Task<LoginResponseDto> RefreshAsync(string? refreshToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new UnauthorizedAccessException("Refresh token is required.");
        }

        var now = DateTime.UtcNow;
        var stored = await _refreshTokenRepository.GetByHashAsync(HashToken(refreshToken), cancellationToken)
                     ?? throw new UnauthorizedAccessException("Invalid refresh token.");

        if (stored.RevokedAt.HasValue)
        {
            if (stored.ReplacedByTokenId.HasValue && now - stored.RevokedAt.Value <= ConcurrentRefreshGrace)
            {
                throw new RefreshTokenAlreadyRotatedException();
            }

            await _refreshTokenRepository.RevokeFamilyAsync(stored.FamilyId, now, cancellationToken);
            await _refreshTokenRepository.SaveChangesAsync(cancellationToken);
            throw new UnauthorizedAccessException("Refresh token has been revoked.");
        }

        if (stored.ExpiresAt <= now)
        {
            throw new UnauthorizedAccessException("Refresh token has expired.");
        }

        var user = await _authRepository.GetUserByIdAsync(stored.UserId);
        if (user is null || user.IsDeleted || user.TokenVersion != stored.TokenVersion)
        {
            await _refreshTokenRepository.RevokeFamilyAsync(stored.FamilyId, now, cancellationToken);
            await _refreshTokenRepository.SaveChangesAsync(cancellationToken);
            throw new UnauthorizedAccessException("Your session has ended. Please sign in again.");
        }

        var (next, issued) = await AddTokenAsync(user, stored.FamilyId, stored.RememberMe, now, cancellationToken);
        stored.RevokedAt = now;
        stored.ReplacedByTokenId = next.Id;
        stored.UpdatedAt = now;
        await _refreshTokenRepository.SaveChangesAsync(cancellationToken);

        var (token, expiresAt) = _jwtTokenProvider.GenerateToken(user, stored.RememberMe);
        var citizen = await _authRepository.GetCitizenByUserIdAsync(user.Id);

        return new LoginResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            RefreshToken = issued.Token,
            RefreshTokenExpiresAt = issued.ExpiresAt,
            UserId = user.Id,
            Role = user.Role.ToString(),
            Names = citizen?.Names,
            Surname = citizen?.Surname,
            RequiresDeviceVerification = false,
        };
    }

    public async Task RevokeAsync(Guid userId, string? refreshToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var stored = await _refreshTokenRepository.GetByHashAsync(HashToken(refreshToken), cancellationToken);
        if (stored is null || stored.UserId != userId)
        {
            return;
        }

        await _refreshTokenRepository.RevokeFamilyAsync(stored.FamilyId, DateTime.UtcNow, cancellationToken);
        await _refreshTokenRepository.SaveChangesAsync(cancellationToken);
    }

    private async Task<(RefreshToken Entity, IssuedRefreshToken Issued)> AddTokenAsync(User user, Guid familyId,
        bool rememberMe, DateTime now, CancellationToken cancellationToken)
    {
        var rawToken = Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32));
        var entity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            FamilyId = familyId,
            TokenHash = HashToken(rawToken),
            TokenVersion = user.TokenVersion,
            RememberMe = rememberMe,
            ExpiresAt = now + (rememberMe ? RememberedLifetime : SessionLifetime),
            CreatedAt = now,
            UpdatedAt = now,
        };

        await _refreshTokenRepository.AddAsync(entity, cancellationToken);
        return (entity, new IssuedRefreshToken(rawToken, entity.ExpiresAt));
    }

    private static string HashToken(string rawToken)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));
    }
}
