using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace tests;

public class KeyRotationServiceTests
{
    private sealed class FakeKeyRotationRepository : IKeyRotationRepository
    {
        public bool ClaimSucceeds = true;
        public bool AlreadyCompletedToday;
        public JobRun? ExistingJobRun;

        public Task<Guid?> TryClaimJobRunAsync(string jobName, DateTime runDate, CancellationToken cancellationToken)
        {
            if (!ClaimSucceeds)
            {
                return Task.FromResult<Guid?>(null);
            }

            ExistingJobRun = new JobRun { Id = Guid.NewGuid(), JobName = jobName, RunDate = runDate, Status = JobRunStatus.Running };
            return Task.FromResult<Guid?>(ExistingJobRun.Id);
        }

        public Task<bool> HasCompletedJobRunTodayAsync(string jobName, DateTime runDate, CancellationToken cancellationToken) => Task.FromResult(AlreadyCompletedToday);

        public Task MarkJobRunCompletedAsync(Guid jobRunId, int processedCount, CancellationToken cancellationToken)
        {
            ExistingJobRun!.Status = JobRunStatus.Completed;
            ExistingJobRun.ProcessedCount = processedCount;
            ExistingJobRun.CompletedAt = DateTime.UtcNow;

            return Task.CompletedTask;
        }

        public Task MarkJobRunFailedAsync(Guid jobRunId, string errorMessage, int processedCount, CancellationToken cancellationToken)
        {
            ExistingJobRun!.Status = JobRunStatus.Failed;
            ExistingJobRun.ErrorMessage = errorMessage;
            ExistingJobRun.ProcessedCount = processedCount;

            return Task.CompletedTask;
        }
    }

    private sealed class FakeSigningKeyRepository : ISigningKeyRepository
    {
        public SigningKey? ActiveKey;
        public List<SigningKey> AddedKeys = new();
        public List<SigningKey> UpdatedKeys = new();
        public int SaveChangesCalls;

        public Task<SigningKey?> GetActiveKeyAsync(SigningKeyPurpose purpose) => Task.FromResult(ActiveKey);

        public Task<SigningKey?> GetByKidAsync(string kid) => Task.FromResult(AddedKeys.Concat(ActiveKey != null ? new[] { ActiveKey } : Array.Empty<SigningKey>()).FirstOrDefault(k => k.Kid == kid));

        public Task AddAsync(SigningKey key)
        {
            AddedKeys.Add(key);
            return Task.CompletedTask;
        }

        public void Update(SigningKey key)
        {
            UpdatedKeys.Add(key);
        }

        public Task SaveChangesAsync()
        {
            SaveChangesCalls++;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeQrSigningKeyVaultInspector : IQrSigningKeyVaultInspector
    {
        public VaultKeyVersion VersionToReturn = new("version-1", new EcPublicJwk("EC", "P-256", "qr-key-version1", "fake-x", "fake-y"));

        public Task<VaultKeyVersion> GetLatestKeyVersionAsync(CancellationToken cancellationToken) => Task.FromResult(VersionToReturn);
    }

    private static IConfiguration CreateConfiguration()
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["QrSigning:KeyName"] = "flashid-qr-signing-v2",
            })
            .Build();
    }

    private static (KeyRotationService Service, FakeKeyRotationRepository JobRunRepo, FakeSigningKeyRepository SigningKeyRepo, FakeQrSigningKeyVaultInspector VaultInspector) CreateService()
    {
        var jobRunRepo = new FakeKeyRotationRepository();
        var signingKeyRepo = new FakeSigningKeyRepository();
        var vaultInspector = new FakeQrSigningKeyVaultInspector();
        var service = new KeyRotationService(jobRunRepo, signingKeyRepo, vaultInspector, CreateConfiguration());

        return (service, jobRunRepo, signingKeyRepo, vaultInspector);
    }

    [Fact]
    public async Task RotateQrSigningKeyAsync_NoActiveKey_AddsNewActiveKey()
    {
        var (service, jobRunRepo, signingKeyRepo, _) = CreateService();

        await service.RotateQrSigningKeyAsync(CancellationToken.None);

        var added = Assert.Single(signingKeyRepo.AddedKeys);
        Assert.Equal(SigningKeyStatus.Active, added.Status);
        Assert.Equal("version-1", added.KeyVaultKeyVersion);
        Assert.Equal(JobRunStatus.Completed, jobRunRepo.ExistingJobRun!.Status);
        Assert.Equal(1, jobRunRepo.ExistingJobRun.ProcessedCount);
    }

    [Fact]
    public async Task RotateQrSigningKeyAsync_VaultVersionMatchesActiveKey_DoesNothing()
    {
        var (service, jobRunRepo, signingKeyRepo, vaultInspector) = CreateService();
        signingKeyRepo.ActiveKey = new SigningKey
        {
            Id = Guid.NewGuid(),
            Kid = "qr-key-version1",
            Purpose = SigningKeyPurpose.Qr,
            Algorithm = "ES256",
            PublicKeyJwk = "{}",
            KeyVaultKeyName = "flashid-qr-signing-v2",
            KeyVaultKeyVersion = vaultInspector.VersionToReturn.Version,
            Status = SigningKeyStatus.Active,
        };

        await service.RotateQrSigningKeyAsync(CancellationToken.None);

        Assert.Empty(signingKeyRepo.AddedKeys);
        Assert.Empty(signingKeyRepo.UpdatedKeys);
        Assert.Equal(JobRunStatus.Completed, jobRunRepo.ExistingJobRun!.Status);
        Assert.Equal(0, jobRunRepo.ExistingJobRun.ProcessedCount);
    }

    [Fact]
    public async Task RotateQrSigningKeyAsync_VaultVersionDiffersFromActiveKey_RetiresOldKeyAndAddsNew()
    {
        var (service, jobRunRepo, signingKeyRepo, _) = CreateService();
        var oldKey = new SigningKey
        {
            Id = Guid.NewGuid(),
            Kid = "qr-key-old",
            Purpose = SigningKeyPurpose.Qr,
            Algorithm = "ES256",
            PublicKeyJwk = "{}",
            KeyVaultKeyName = "flashid-qr-signing-v2",
            KeyVaultKeyVersion = "old-version",
            Status = SigningKeyStatus.Active,
        };
        signingKeyRepo.ActiveKey = oldKey;

        await service.RotateQrSigningKeyAsync(CancellationToken.None);

        var updated = Assert.Single(signingKeyRepo.UpdatedKeys);
        Assert.Equal(SigningKeyStatus.Retired, updated.Status);
        Assert.NotNull(updated.RetiredAt);

        var added = Assert.Single(signingKeyRepo.AddedKeys);
        Assert.Equal(SigningKeyStatus.Active, added.Status);
        Assert.Equal("version-1", added.KeyVaultKeyVersion);

        Assert.Equal(JobRunStatus.Completed, jobRunRepo.ExistingJobRun!.Status);
        Assert.Equal(1, jobRunRepo.ExistingJobRun.ProcessedCount);
    }

    [Fact]
    public async Task RotateQrSigningKeyAsync_ClaimFails_DoesNothing()
    {
        var (service, jobRunRepo, signingKeyRepo, _) = CreateService();
        jobRunRepo.ClaimSucceeds = false;

        await service.RotateQrSigningKeyAsync(CancellationToken.None);

        Assert.Empty(signingKeyRepo.AddedKeys);
        Assert.Null(jobRunRepo.ExistingJobRun);
    }

    [Fact]
    public async Task HasCompletedTodayAsync_DelegatesToRepository()
    {
        var (service, jobRunRepo, _, _) = CreateService();
        jobRunRepo.AlreadyCompletedToday = true;

        var result = await service.HasCompletedTodayAsync(CancellationToken.None);

        Assert.True(result);
    }
}