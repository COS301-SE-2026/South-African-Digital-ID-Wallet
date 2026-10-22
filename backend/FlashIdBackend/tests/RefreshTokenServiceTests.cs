using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.Auth.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class RefreshTokenServiceTests
{
    private sealed class FakeJwtTokenProvider : IJwtTokenProvider
    {
        public (string Token, DateTime ExpiresAt) GenerateToken(User user) =>
            ("access-token", DateTime.UtcNow.AddMinutes(15));
    }

    private sealed class RacingRefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly IRefreshTokenRepository _inner;
        private Func<Task>? _beforeFirstRead;

        public RacingRefreshTokenRepository(IRefreshTokenRepository inner, Func<Task> beforeFirstRead)
        {
            _inner = inner;
            _beforeFirstRead = beforeFirstRead;
        }

        public Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken) =>
            _inner.AddAsync(refreshToken, cancellationToken);

        public async Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken)
        {
            var stored = await _inner.GetByHashAsync(tokenHash, cancellationToken);
            var race = _beforeFirstRead;
            _beforeFirstRead = null;
            if (race is not null)
            {
                await race();
            }
            return stored;
        }

        public Task<bool> TryMarkRotatedAsync(Guid tokenId, Guid replacedByTokenId, DateTime rotatedAt, CancellationToken cancellationToken) =>
            _inner.TryMarkRotatedAsync(tokenId, replacedByTokenId, rotatedAt, cancellationToken);

        public Task RevokeFamilyAsync(Guid familyId, DateTime revokedAt, CancellationToken cancellationToken) =>
            _inner.RevokeFamilyAsync(familyId, revokedAt, cancellationToken);

        public Task RemoveExpiredAsync(Guid userId, DateTime now, CancellationToken cancellationToken) =>
            _inner.RemoveExpiredAsync(userId, now, cancellationToken);

        public Task SaveChangesAsync(CancellationToken cancellationToken) =>
            _inner.SaveChangesAsync(cancellationToken);
    }

    private static AppDbContext CreateContext(SqliteConnection connection)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
        return new AppDbContext(options);
    }

    private static RefreshTokenService CreateService(AppDbContext context, IRefreshTokenRepository? repository = null) =>
        new(repository ?? new RefreshTokenRepository(context), new AuthRepository(context), new FakeJwtTokenProvider());

    private static async Task<User> SeedUserAsync(AppDbContext context)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = $"user-{Guid.NewGuid():N}@flashid.test",
            PhoneNumber = "+27821234567",
            PasswordHash = "unused",
            Role = UserRole.Citizen,
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        context.DomainUsers.Add(user);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        return user;
    }

    [Fact]
    public async Task RefreshAsync_WhenAnotherRequestRotatesTheSameTokenFirst_ThrowsAlreadyRotatedWithoutForkingTheSession()
    {
        var ct = TestContext.Current.CancellationToken;
        using var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();
        await using var setupContext = CreateContext(connection);
        await setupContext.Database.EnsureCreatedAsync(ct);
        var user = await SeedUserAsync(setupContext);
        var issued = await CreateService(setupContext).IssueAsync(user, rememberMe: true, ct);

        await using var winnerContext = CreateContext(connection);
        await using var loserContext = CreateContext(connection);
        var racing = new RacingRefreshTokenRepository(
            new RefreshTokenRepository(loserContext),
            () => CreateService(winnerContext).RefreshAsync(issued.Token, ct));

        await Assert.ThrowsAsync<RefreshTokenAlreadyRotatedException>(
            () => CreateService(loserContext, racing).RefreshAsync(issued.Token, ct));

        await using var verifyContext = CreateContext(connection);
        var tokens = await verifyContext.RefreshTokens.AsNoTracking().ToListAsync(ct);
        Assert.Equal(2, tokens.Count);
        Assert.Single(tokens, t => t.RevokedAt == null);
    }

    [Fact]
    public async Task IssueAsync_KeepsRevokedTokensUntilTheyExpire()
    {
        var ct = TestContext.Current.CancellationToken;
        using var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();
        await using var context = CreateContext(connection);
        await context.Database.EnsureCreatedAsync(ct);
        var user = await SeedUserAsync(context);
        var service = CreateService(context);
        var first = await service.IssueAsync(user, rememberMe: true, ct);
        await service.RefreshAsync(first.Token, ct);
        var rotated = await context.RefreshTokens.SingleAsync(t => t.RevokedAt != null, ct);
        rotated.RevokedAt = DateTime.UtcNow.AddDays(-20);
        await context.SaveChangesAsync(ct);

        await service.IssueAsync(user, rememberMe: true, ct);

        Assert.True(await context.RefreshTokens.AnyAsync(t => t.Id == rotated.Id, ct));
    }

    [Fact]
    public async Task IssueAsync_RemovesExpiredTokens()
    {
        var ct = TestContext.Current.CancellationToken;
        using var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();
        await using var context = CreateContext(connection);
        await context.Database.EnsureCreatedAsync(ct);
        var user = await SeedUserAsync(context);
        var service = CreateService(context);
        await service.IssueAsync(user, rememberMe: false, ct);
        var expired = await context.RefreshTokens.SingleAsync(ct);
        expired.ExpiresAt = DateTime.UtcNow.AddMinutes(-1);
        await context.SaveChangesAsync(ct);

        await service.IssueAsync(user, rememberMe: false, ct);

        Assert.False(await context.RefreshTokens.AnyAsync(t => t.Id == expired.Id, ct));
    }
}
