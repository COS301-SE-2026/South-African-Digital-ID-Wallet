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
        var key = response.Value;

        var version = key.Properties.Version;
        var x = Base64Url.EncodeToString(key.Key.X);
        var y = Base64Url.EncodeToString(key.Key.Y);
        var jwk = new EcPublicJwk("EC", "P-256", $"qr-key-{version[..8]}", x, y);

        return new VaultKeyVersion(version, jwk);
    }
}