using System.Security.Cryptography;
using System.Text;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Providers;
using Infrastructure.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class StubQrSigningProviderTests
{
    private static AppDbContext CreateInMemoryContext()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    [Fact]
    public async Task GetActiveKeyAsync_NoExistingKey_CreatesAndPersistsNewKey()
    {
        using var context = CreateInMemoryContext();
        var repo = new SigningKeyRepository(context);
        var provider = new StubQrSigningProvider(repo);

        var key = await provider.GetActiveKeyAsync(CancellationToken.None);

        Assert.Equal("ES256", key.Algorithm);
        Assert.NotNull(key.PublicJwk);
        Assert.Equal("EC", key.PublicJwk.Kty);
        Assert.Equal("P-256", key.PublicJwk.Crv);

        var persisted = await repo.GetActiveKeyAsync(SigningKeyPurpose.Qr);
        Assert.NotNull(persisted);
        Assert.Equal(key.KeyId, persisted!.Kid);
        Assert.Equal(SigningKeyStatus.Active, persisted.Status);
    }

    [Fact]
    public async Task GetActiveKeyAsync_CalledTwice_ReturnsSameKey_DoesNotCreateDuplicate()
    {
        using var context = CreateInMemoryContext();
        var repo = new SigningKeyRepository(context);
        var provider = new StubQrSigningProvider(repo);

        var first = await provider.GetActiveKeyAsync(CancellationToken.None);
        var second = await provider.GetActiveKeyAsync(CancellationToken.None);

        Assert.Equal(first.KeyId, second.KeyId);
        Assert.Equal(first.PublicJwk.X, second.PublicJwk.X);
        Assert.Equal(first.PublicJwk.Y, second.PublicJwk.Y);
    }

    [Fact]
    public async Task SignAsync_ProducesValidSignature_VerifiableAgainstReturnedPublicKey()
    {
        using var context = CreateInMemoryContext();
        var repo = new SigningKeyRepository(context);
        var provider = new StubQrSigningProvider(repo);

        var key = await provider.GetActiveKeyAsync(CancellationToken.None);
        var data = Encoding.UTF8.GetBytes("some QR payload");
        var signature = await provider.SignAsync(key.KeyId, data, CancellationToken.None);

        using var verifier = ECDsa.Create(new ECParameters
        {
            Curve = ECCurve.NamedCurves.nistP256,
            Q = new ECPoint
            {
                X = System.Buffers.Text.Base64Url.DecodeFromChars(key.PublicJwk.X),
                Y = System.Buffers.Text.Base64Url.DecodeFromChars(key.PublicJwk.Y),
            },
        });

        var valid = verifier.VerifyData(data, signature, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

        Assert.True(valid);
    }

    [Fact]
    public async Task SignAsync_KeyIdDoesNotMatchActiveKey_Throws()
    {
        using var context = CreateInMemoryContext();
        var repo = new SigningKeyRepository(context);
        var provider = new StubQrSigningProvider(repo);

        await provider.GetActiveKeyAsync(CancellationToken.None);
        var data = Encoding.UTF8.GetBytes("some QR payload");

        await Assert.ThrowsAsync<InvalidOperationException>(() => provider.SignAsync("wrong-kid", data, CancellationToken.None));
    }
}
