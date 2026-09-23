using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace Application.Common.Services;

public class KeyRotationService : IKeyRotationService
{
    private const string JobName = "QrKeyRotation";

    private readonly IKeyRotationRepository _jobRunRepo;
    private readonly ISigningKeyRepository _signingKeyRepo;
    private readonly IQrSigningKeyVaultInspector _vaultInspector;
    private readonly string _keyVaultKeyName;

    public KeyRotationService(IKeyRotationRepository jobRunRepo, ISigningKeyRepository signingKeyRepo, IQrSigningKeyVaultInspector vaultInspector, IConfiguration config)
    {
        _jobRunRepo = jobRunRepo;
        _signingKeyRepo = signingKeyRepo;
        _vaultInspector = vaultInspector;

        var keyName = config["QrSigning:KeyName"];
        if (string.IsNullOrWhiteSpace(keyName))
        {
            throw new InvalidOperationException("QrSigning:KeyName is not configured.");
        }
        _keyVaultKeyName = keyName;
    }

    public async Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken)
    {
        var runDate = SastClock.TodayUtcMidnight(DateTime.UtcNow);

        return await _jobRunRepo.HasCompletedJobRunTodayAsync(JobName, runDate, cancellationToken);
    }

    public async Task RotateQrSigningKeyAsync(CancellationToken cancellationToken)
    {
        var runDate = SastClock.TodayUtcMidnight(DateTime.UtcNow);
        var jobRunId = await _jobRunRepo.TryClaimJobRunAsync(JobName, runDate, cancellationToken);

        if (jobRunId is null)
        {
            return;
        }

        var processedCount = 0;

        try
        {
            var activeKey = await _signingKeyRepo.GetActiveKeyAsync(SigningKeyPurpose.Qr);
            var latestVaultVersion = await _vaultInspector.GetLatestKeyVersionAsync(cancellationToken);

            if (activeKey == null || activeKey.KeyVaultKeyVersion != latestVaultVersion.Version)
            {
                var now = DateTime.UtcNow;

                if (activeKey != null)
                {
                    activeKey.Status = SigningKeyStatus.Retired;
                    activeKey.RetiredAt = now;
                    activeKey.UpdatedAt = now;
                    _signingKeyRepo.Update(activeKey);
                }

                var newKey = new SigningKey
                {
                    Id = Guid.NewGuid(),
                    Kid = latestVaultVersion.PublicJwk.Kid,
                    Purpose = SigningKeyPurpose.Qr,
                    Algorithm = "ES256",
                    PublicKeyJwk = JsonSerializer.Serialize(new
                    {
                        crv = latestVaultVersion.PublicJwk.Crv,
                        x = latestVaultVersion.PublicJwk.X,
                        y = latestVaultVersion.PublicJwk.Y,
                    }),
                    KeyVaultKeyName = _keyVaultKeyName,
                    KeyVaultKeyVersion = latestVaultVersion.Version,
                    Status = SigningKeyStatus.Active,
                    CreatedAt = now,
                    UpdatedAt = now,
                };

                await _signingKeyRepo.AddAsync(newKey);
                await _signingKeyRepo.SaveChangesAsync();

                processedCount = 1;
            }

            await _jobRunRepo.MarkJobRunCompletedAsync(jobRunId.Value, processedCount, cancellationToken);
        }
        catch (Exception e)
        {
            await _jobRunRepo.MarkJobRunFailedAsync(jobRunId.Value, e.Message, processedCount, cancellationToken);
        }
    }
}