using System.Security.Cryptography;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Azure.Core;
using Azure.Security.KeyVault.Keys.Cryptography;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public class AzureKeyVaultQrSigningProvider : IQrSigningProvider
{
    private readonly ISigningKeyRepository _signingKeyRepository;
    private readonly TokenCredential _credential;
    private readonly string _vaultUri;

    public AzureKeyVaultQrSigningProvider(ISigningKeyRepository signingKeyRepository, TokenCredential credential, IConfiguration config)
    {
        _signingKeyRepository = signingKeyRepository;
        _credential = credential;

        var vaultUri = config["AzureKeyVault:VaultUri"];
        if (string.IsNullOrWhiteSpace(vaultUri))
        {
            throw new InvalidOperationException("AzureKeyVault:VaultUri is not configured.");
        }
        _vaultUri = vaultUri.TrimEnd('/');
    }

    public async Task<QrSigningKey> GetActiveKeyAsync(CancellationToken cancellationToken)
    {
        var signingKey = await _signingKeyRepository.GetActiveKeyAsync(SigningKeyPurpose.Qr)
            ?? throw new InvalidOperationException("No active QR signing key configured.");

        return new QrSigningKey(signingKey.Kid, signingKey.Algorithm, ParsePublicJwk(signingKey));
    }

    public async Task<byte[]> SignAsync(string keyId, byte[] signingInput, CancellationToken cancellationToken)
    {
        var signingKey = await _signingKeyRepository.GetActiveKeyAsync(SigningKeyPurpose.Qr)
            ?? throw new InvalidOperationException("No active QR signing key configured.");

        if (keyId != signingKey.Kid)
        {
            throw new InvalidOperationException($"QR signing key '{keyId}' is not the active key.");
        }

        var keyIdentifier = new Uri($"{_vaultUri}/keys/{signingKey.KeyVaultKeyName}/{signingKey.KeyVaultKeyVersion}");
        var cryptoClient = new CryptographyClient(keyIdentifier, _credential);

        var digest = SHA256.HashData(signingInput);
        var result = await cryptoClient.SignAsync(SignatureAlgorithm.ES256, digest, cancellationToken);

        return result.Signature;
    }

    private static EcPublicJwk ParsePublicJwk(SigningKey signingKey)
    {
        using var doc = JsonDocument.Parse(signingKey.PublicKeyJwk);
        var root = doc.RootElement;

        var crv = root.TryGetProperty("crv", out var crvProp) ? crvProp.GetString() ?? "P-256" : "P-256";
        var x = root.GetProperty("x").GetString() ?? throw new InvalidOperationException("Signing key public JWK missing 'x'.");
        var y = root.GetProperty("y").GetString() ?? throw new InvalidOperationException("Signing key public JWK missing 'y'.");

        return new EcPublicJwk("EC", crv, signingKey.Kid, x, y);
    }
}