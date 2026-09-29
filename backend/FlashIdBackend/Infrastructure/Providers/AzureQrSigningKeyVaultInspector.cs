using System.Buffers.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Azure.Core;
using Azure.Security.KeyVault.Keys;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public class AzureQrSigningKeyVaultInspector : IQrSigningKeyVaultInspector
{
    private readonly KeyClient _keyClient;
    private readonly string _keyName;

    public AzureQrSigningKeyVaultInspector(TokenCredential credential, IConfiguration config)
    {
        var vaultUri = config["AzureKeyVault:VaultUri"];
        if (string.IsNullOrWhiteSpace(vaultUri))
        {
            throw new InvalidOperationException("AzureKeyVault:VaultUri is not configured.");
        }

        var keyName = config["QrSigning:KeyName"];
        if (string.IsNullOrWhiteSpace(keyName))
        {
            throw new InvalidOperationException("QrSigning:KeyName is not configured.");
        }

        _keyClient = new KeyClient(new Uri(vaultUri), credential);
        _keyName = keyName;
    }

    public async Task<VaultKeyVersion> GetLatestKeyVersionAsync(CancellationToken cancellationToken)
    {
        var response = await _keyClient.GetKeyAsync(_keyName, cancellationToken: cancellationToken);
        return ToVaultKeyVersion(response.Value);
    }

    public static VaultKeyVersion ToVaultKeyVersion(KeyVaultKey key)
    {
        var version = key.Properties.Version;
        if (string.IsNullOrWhiteSpace(version))
        {
            throw new InvalidOperationException("Key Vault key has no version.");
        }

        if (key.Properties.Enabled != true)
        {
            throw new InvalidOperationException($"Key Vault key version '{version}' is not enabled.");
        }

        if (key.KeyType != KeyType.Ec && key.KeyType != KeyType.EcHsm)
        {
            throw new InvalidOperationException($"Key Vault key version '{version}' has type '{key.KeyType}', expected EC or EC-HSM.");
        }

        if (key.Key.CurveName != KeyCurveName.P256)
        {
            throw new InvalidOperationException($"Key Vault key version '{version}' uses curve '{key.Key.CurveName}', expected P-256.");
        }

        if (key.Key.X is not { Length: 32 } || key.Key.Y is not { Length: 32 })
        {
            throw new InvalidOperationException($"Key Vault key version '{version}' has invalid P-256 public key coordinates.");
        }

        var x = Base64Url.EncodeToString(key.Key.X);
        var y = Base64Url.EncodeToString(key.Key.Y);

        var jwk = new EcPublicJwk("EC", "P-256", $"qr-key-{version}", x, y);

        return new VaultKeyVersion(version, jwk);
    }
}