using Application.Common.Interfaces.RepositoryInterfaces;
using Azure.Core;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Providers;
using Microsoft.Extensions.Configuration;

namespace tests;

public class AzureKeyVaultQrSigningProviderTests
{
    private sealed class FakeSigningKeyRepository : ISigningKeyRepository
    {
        public List<SigningKey> Keys = new();

        public Task<SigningKey?> GetActiveKeyAsync(SigningKeyPurpose purpose) => Task.FromResult<SigningKey?>(null);

        public Task<SigningKey?> GetByKidAsync(string kid) => Task.FromResult(Keys.FirstOrDefault(k => k.Kid == kid));

        public Task AddAsync(SigningKey key)
        {
            Keys.Add(key);
            return Task.CompletedTask;
        }

        public void Update(SigningKey key)
        {
        }

        public Task SaveChangesAsync() => Task.CompletedTask;
    }
    private sealed class ThrowingTokenCredential : TokenCredential
    {
        public override AccessToken GetToken(TokenRequestContext requestContext, CancellationToken cancellationToken) =>
            throw new InvalidOperationException("Key Vault should not be contacted in this test.");

        public override ValueTask<AccessToken> GetTokenAsync(TokenRequestContext requestContext, CancellationToken cancellationToken) =>
            throw new InvalidOperationException("Key Vault should not be contacted in this test.");
    }

    private static IConfiguration CreateConfiguration(string? vaultUri = "https://fake-vault.vault.azure.net/")
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AzureKeyVault:VaultUri"] = vaultUri,
            })
            .Build();
    }

    private static SigningKey CreateKey(string kid, SigningKeyPurpose purpose, SigningKeyStatus status)
    {
        return new SigningKey
        {
            Id = Guid.NewGuid(),
            Kid = kid,
            Purpose = purpose,
            Algorithm = "ES256",
            PublicKeyJwk = "{\"crv\":\"P-256\",\"x\":\"fake-x\",\"y\":\"fake-y\"}",
            KeyVaultKeyName = "flashid-qr-signing-v2",
            KeyVaultKeyVersion = "version-1",
            Status = status,
        };
    }

    private static (AzureKeyVaultQrSigningProvider Provider, FakeSigningKeyRepository Repo) CreateProvider()
    {
        var repo = new FakeSigningKeyRepository();
        var provider = new AzureKeyVaultQrSigningProvider(repo, new ThrowingTokenCredential(), CreateConfiguration());
        return (provider, repo);
    }

    private static readonly byte[] SigningInput = "header.payload"u8.ToArray();

    [Fact]
    public void Constructor_MissingVaultUri_Throws()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            new AzureKeyVaultQrSigningProvider(new FakeSigningKeyRepository(), new ThrowingTokenCredential(), CreateConfiguration(vaultUri: null)));

        Assert.Contains("VaultUri", ex.Message);
    }

    [Fact]
    public async Task GetActiveKeyAsync_NoActiveKey_Throws()
    {
        var (provider, _) = CreateProvider();

        await Assert.ThrowsAsync<InvalidOperationException>(() => provider.GetActiveKeyAsync(CancellationToken.None));
    }

    [Fact]
    public async Task SignAsync_UnknownKid_Throws()
    {
        var (provider, _) = CreateProvider();

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            provider.SignAsync("does-not-exist", SigningInput, CancellationToken.None));

        Assert.Contains("was not found", ex.Message);
    }

    [Fact]
    public async Task SignAsync_PdfPurposeKey_Throws()
    {
        var (provider, repo) = CreateProvider();
        repo.Keys.Add(CreateKey("pdf-key", SigningKeyPurpose.Pdf, SigningKeyStatus.Active));

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            provider.SignAsync("pdf-key", SigningInput, CancellationToken.None));

        Assert.Contains("is not a QR signing key", ex.Message);
    }

    [Fact]
    public async Task SignAsync_RevokedKey_Throws()
    {
        var (provider, repo) = CreateProvider();
        repo.Keys.Add(CreateKey("revoked-key", SigningKeyPurpose.Qr, SigningKeyStatus.Revoked));

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            provider.SignAsync("revoked-key", SigningInput, CancellationToken.None));

        Assert.Contains("not usable for signing", ex.Message);
    }
}