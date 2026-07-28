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
}