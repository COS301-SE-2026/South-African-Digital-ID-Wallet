using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.Verification.Dtos;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class CitizenVerificationServiceTests
{
    private const string RawToken = "activation-token";
    private const string ValidPin = "123456";
    private const string ValidSaId = "9001015800086";
    private const string TestIpAddress = "196.25.1.10";

    private static string Sha256Hex(string raw) => Convert.ToHexString(
        System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(raw))
    );

    private sealed class FakeVerificationRepo : IVerificationRepository
    {
        public CitizenActivation? Activation;
        public Citizen? CitizenForUser;
        public string? RequestedHash;
        public List<AuditLog> AuditLogs = new();
        public int Saves;
        public Task<CitizenActivation?> GetActivationByTokenHashAsync(string hash, CancellationToken c) { RequestedHash = hash; return Task.FromResult(Activation); }
        public Task<Citizen?> GetCitizenByUserIdAsync(Guid userId, CancellationToken c) => Task.FromResult(CitizenForUser);
        public Task AddAuditLogAsync(AuditLog log, CancellationToken c) { AuditLogs.Add(log); return Task.CompletedTask; }
        public Task SaveChangesAsync(CancellationToken c) { Saves++; return Task.CompletedTask; }
    }

    private sealed class Ctx
    {
        public FakeVerificationRepo Repo = null!;
        public Citizen Citizen = null!;
        public CitizenActivation Activation = null!;
        public CitizenVerificationService Service = null!;
    }

    private static Ctx Setup(Guid? citizenUserId = null, string citizenSaId = ValidSaId, string pin = ValidPin, ActivationStatus status = ActivationStatus.Pending, DateTime? expiresAt = null, DateTime? lockedUntil = null, int attemptCount = 0, bool noCitizen = false, bool noActivation = false, Citizen? citizenForUser = null)
    {
        var citizen = new Citizen { Id = Guid.NewGuid(), SaId = citizenSaId, UserId = citizenUserId, Status = CitizenStatus.Pending };
        var activation = new CitizenActivation
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Citizen = noCitizen ? null! : citizen,
            PinHash = BCrypt.Net.BCrypt.HashPassword(pin, workFactor: 4),
            Status = status,
            ExpiresAt = expiresAt ?? DateTime.UtcNow.AddHours(24),
            LockedUntil = lockedUntil,
            AttemptCount = attemptCount,
        };
        var repo = new FakeVerificationRepo { Activation = noActivation ? null : activation, CitizenForUser = citizenForUser };
        return new Ctx { Repo = repo, Citizen = citizen, Activation = activation, Service = new CitizenVerificationService(repo) };
    }

    private static Task<VerificationResponseDto> Act(Ctx c, Guid userId, string token = RawToken, string saId = ValidSaId, string pin = ValidPin) => c.Service.VerifyCitizenActivation(new VerificationRequestDto { Token = token, SaId = saId, Pin = pin }, userId, TestIpAddress, TestContext.Current.CancellationToken);

    [Fact]
    public void ValidateActivationState_AlreadyUsed_Throws()
    {
        var now = DateTime.UtcNow;
        var a = new CitizenActivation { Status = ActivationStatus.Used, ExpiresAt = now.AddHours(1) };
        var ex = Assert.Throws<InvalidOperationException>(() => CitizenVerificationService.ValidateActivationState(a, now));
        Assert.Contains("already been used", ex.Message);
    }

    [Fact]
    public void ValidateActivationState_Revoked_Throws()
    {
        var now = DateTime.UtcNow;
        var a = new CitizenActivation { Status = ActivationStatus.Revoked, ExpiresAt = now.AddHours(1) };
        var ex = Assert.Throws<InvalidOperationException>(() => CitizenVerificationService.ValidateActivationState(a, now));
        Assert.Contains("no longer valid", ex.Message);
    }

    [Fact]
    public void ValidateActivationState_Expired_Throws()
    {
        var now = DateTime.UtcNow;
        var a = new CitizenActivation { ExpiresAt = now.AddMinutes(-1) };
        var ex = Assert.Throws<InvalidOperationException>(() => CitizenVerificationService.ValidateActivationState(a, now));
        Assert.Contains("expired", ex.Message);
    }

    [Fact]
    public void ValidateActivationState_Locked_ThrowsWithMinutesRemaining()
    {
        var now = DateTime.UtcNow;
        var a = new CitizenActivation { ExpiresAt = now.AddHours(1), LockedUntil = now.AddMinutes(5) };
        var ex = Assert.Throws<InvalidOperationException>(() => CitizenVerificationService.ValidateActivationState(a, now));
        Assert.Contains("temporarily locked", ex.Message);
        Assert.Contains("5 minutes", ex.Message);
    }

    [Theory]
    [InlineData("", ValidSaId, ValidPin)]
    [InlineData(RawToken, "123", ValidPin)]
    [InlineData(RawToken, ValidSaId, "12ab56")]
    public async Task InvalidRequest_ThrowsArgumentException(string token, string saId, string pin)
    {
        var c = Setup();
        await Assert.ThrowsAsync<ArgumentException>(() => Act(c, Guid.NewGuid(), token, saId, pin));
        Assert.Null(c.Repo.RequestedHash);
    }

    [Fact]
    public async Task UnknownToken_Throws()
    {
        var c = Setup(noActivation: true);
        await Assert.ThrowsAsync<InvalidOperationException>(() => Act(c, Guid.NewGuid()));
        Assert.Equal(Sha256Hex(RawToken), c.Repo.RequestedHash);
    }

    [Fact]
    public async Task ActivationWithoutCitizen_Throws()
    {
        var c = Setup(noCitizen: true);
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => Act(c, Guid.NewGuid()));
        Assert.Contains("could not be found", ex.Message);
    }

    [Fact]
    public async Task ValidDetails_VerifiesCitizenAndConsumesActivation()
    {
        var c = Setup();
        var userId = Guid.NewGuid();
        var response = await Act(c, userId);
        Assert.True(response.IsVerified);
        Assert.Equal(c.Citizen.Id, response.CitizenId);
        Assert.Equal(nameof(CitizenStatus.Verified), response.Status);
        Assert.Equal(userId, c.Citizen.UserId);
        Assert.Equal(CitizenStatus.Verified, c.Citizen.Status);
        Assert.Equal(ActivationStatus.Used, c.Activation.Status);
        Assert.NotNull(c.Activation.UsedAt);
        Assert.Null(c.Activation.LockedUntil);
        var log = Assert.Single(c.Repo.AuditLogs);
        Assert.Equal(AuditEventType.CitizenVerified, log.EventType);
        Assert.Equal(userId, log.ActorId);
        Assert.Equal(TestIpAddress, log.IpAddress);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Fact]
    public async Task SaIdMismatch_RecordsFailedAttempt()
    {
        var c = Setup(citizenSaId: "8001015800087");
        await Assert.ThrowsAsync<InvalidOperationException>(() => Act(c, Guid.NewGuid()));
        Assert.Equal(1, c.Activation.AttemptCount);
        Assert.Equal(1, c.Repo.Saves);
        Assert.Empty(c.Repo.AuditLogs);
    }

    [Fact]
    public async Task WrongPin_RecordsFailedAttempt()
    {
        var c = Setup();
        await Assert.ThrowsAsync<InvalidOperationException>(() => Act(c, Guid.NewGuid(), pin: "999999"));
        Assert.Equal(1, c.Activation.AttemptCount);
        Assert.Equal(1, c.Repo.Saves);
    }

    [Theory]
    [InlineData(2, 5)]
    [InlineData(4, 10)]
    public async Task WrongPinAtThreshold_LocksActivation(int startingAttempts, int expectedLockMinutes)
    {
        var c = Setup(attemptCount: startingAttempts);
        var before = DateTime.UtcNow;
        await Assert.ThrowsAsync<InvalidOperationException>(() => Act(c, Guid.NewGuid(), pin: "999999"));
        Assert.Equal(startingAttempts + 1, c.Activation.AttemptCount);
        Assert.NotNull(c.Activation.LockedUntil);
        var lockedFor = c.Activation.LockedUntil!.Value - before;
        Assert.InRange(lockedFor, TimeSpan.FromMinutes(expectedLockMinutes - 1), TimeSpan.FromMinutes(expectedLockMinutes + 1));
    }

    [Fact]
    public async Task SixthWrongPin_RevokesActivation()
    {
        var c = Setup(attemptCount: 5);
        await Assert.ThrowsAsync<InvalidOperationException>(() => Act(c, Guid.NewGuid(), pin: "999999"));
        Assert.Equal(ActivationStatus.Revoked, c.Activation.Status);
        Assert.NotNull(c.Activation.RevokedAt);
        Assert.Null(c.Activation.LockedUntil);
    }

    [Fact]
    public async Task ExpiredLock_IsClearedAndVerificationProceeds()
    {
        var c = Setup(lockedUntil: DateTime.UtcNow.AddMinutes(-1));
        var response = await Act(c, Guid.NewGuid());
        Assert.True(response.IsVerified);
        Assert.Null(c.Activation.LockedUntil);
    }

    [Fact]
    public async Task CitizenAlreadyLinkedToAnotherUser_Throws()
    {
        var c = Setup(citizenUserId: Guid.NewGuid());
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => Act(c, Guid.NewGuid()));
        Assert.Contains("linked to another account", ex.Message);
    }

    [Fact]
    public async Task UserAlreadyLinkedToAnotherCitizen_Throws()
    {
        var c = Setup(citizenForUser: new Citizen { Id = Guid.NewGuid(), SaId = "8001015800087" });
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => Act(c, Guid.NewGuid()));
        Assert.Contains("linked to another citizen", ex.Message);
    }
}