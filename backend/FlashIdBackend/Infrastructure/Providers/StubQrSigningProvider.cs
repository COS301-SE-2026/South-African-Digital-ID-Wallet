using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Domain.Entities;
using Domain.Enums;

namespace Infrastructure.Providers;

// Used only when Key Vault is not configured (e.g. local/E2E/CI environments without Azure access).
// Generates an in-memory P-256 key pair for the lifetime of the process and keeps a matching SigningKeys row in sync, so QR signing and verification work end-to-end without Key Vault.
// Never used in production:AddInfrastructure only wires this in when AzureKeyVault:VaultUri is unset.
public class StubQrSigningProvider : IQrSigningProvider
{
    private const string KeyVaultKeyName = "stub-local-qr-signing-key";
    private static readonly ECDsa PrivateKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
    private static readonly object SignLock = new();

    private readonly ISigningKeyRepository _signingKeyRepository;

    public StubQrSigningProvider(ISigningKeyRepository signingKeyRepository)
    {
        _signingKeyRepository = signingKeyRepository;
    }

    public async Task<QrSigningKey> GetActiveKeyAsync(CancellationToken cancellationToken)
    {
        var parameters = PrivateKey.ExportParameters(false);
        var currentX = Base64Url.EncodeToString(parameters.Q.X!);
        var currentY = Base64Url.EncodeToString(parameters.Q.Y!);

        var existing = await _signingKeyRepository.GetActiveKeyAsync(SigningKeyPurpose.Qr);

        if (existing != null)
        {
            var existingJwk = JsonDocument.Parse(existing.PublicKeyJwk).RootElement;
            var existingX = existingJwk.TryGetProperty("x", out var xProp) ? xProp.GetString() : null;
            var existingY = existingJwk.TryGetProperty("y", out var yProp) ? yProp.GetString() : null;

            if (existingX == currentX && existingY == currentY)
            {
                return new QrSigningKey(existing.Kid, existing.Algorithm, new EcPublicJwk("EC", "P-256", existing.Kid, currentX, currentY));
            }
        }

        var kid = $"qr-key-stub-{Guid.NewGuid():N}"[..20];
        var now = DateTime.UtcNow;

        if (existing != null)
        {
            existing.Status = SigningKeyStatus.Retired;
            existing.RetiredAt = now;
            existing.UpdatedAt = now;
            _signingKeyRepository.Update(existing);
        }

        var newKey = new SigningKey
        {
            Id = Guid.NewGuid(),
            Kid = kid,
            Purpose = SigningKeyPurpose.Qr,
            Algorithm = "ES256",
            PublicKeyJwk = JsonSerializer.Serialize(new { crv = "P-256", x = currentX, y = currentY }),
            KeyVaultKeyName = KeyVaultKeyName,
            KeyVaultKeyVersion = "local",
            Status = SigningKeyStatus.Active,
            CreatedAt = now,
            UpdatedAt = now,
        };

        await _signingKeyRepository.AddAsync(newKey);
        await _signingKeyRepository.SaveChangesAsync();

        return new QrSigningKey(kid, "ES256", new EcPublicJwk("EC", "P-256", kid, currentX, currentY));
    }

    public async Task<byte[]> SignAsync(string keyId, byte[] signingInput, CancellationToken cancellationToken)
    {
        var activeKey = await _signingKeyRepository.GetActiveKeyAsync(SigningKeyPurpose.Qr)
            ?? throw new InvalidOperationException("No active QR signing key configured.");

        if (keyId != activeKey.Kid)
        {
            throw new InvalidOperationException($"QR signing key '{keyId}' is not the active key.");
        }

        byte[] signature;
        lock (SignLock)
        {
            signature = PrivateKey.SignData(signingInput, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);
        }

        return signature;
    }
}