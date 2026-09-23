using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text.Json;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Domain.Entities;
using Domain.Enums;

namespace tests;

public class QrSignatureVerifierTests
{
    private sealed class FakeSigningKeyRepository : ISigningKeyRepository
    {
        public SigningKey? KeyToReturn;

        public Task<SigningKey?> GetActiveKeyAsync(SigningKeyPurpose purpose) => Task.FromResult<SigningKey?>(null);

        public Task<SigningKey?> GetByKidAsync(string kid) => Task.FromResult(KeyToReturn != null && KeyToReturn.Kid == kid ? KeyToReturn : null);

        public Task AddAsync(SigningKey key) => Task.CompletedTask;

        public void Update(SigningKey key)
        {
        }

        public Task SaveChangesAsync() => Task.CompletedTask;
    }

    private static (SigningKey Key, ECDsa PrivateKey) CreateActiveKey(string kid = "test-kid", SigningKeyStatus status = SigningKeyStatus.Active)
    {
        var ecdsa = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var parameters = ecdsa.ExportParameters(false);
        var x = Base64Url.EncodeToString(parameters.Q.X!);
        var y = Base64Url.EncodeToString(parameters.Q.Y!);

        var key = new SigningKey
        {
            Id = Guid.NewGuid(),
            Kid = kid,
            Purpose = SigningKeyPurpose.Qr,
            Algorithm = "ES256",
            PublicKeyJwk = JsonSerializer.Serialize(new { crv = "P-256", x, y }),
            KeyVaultKeyName = "test-key",
            KeyVaultKeyVersion = "v1",
            Status = status,
        };

        return (key, ecdsa);
    }

    [Fact]
    public async Task VerifyAsync_ValidSignature_ReturnsTrue()
    {
        var repo = new FakeSigningKeyRepository();
        var (key, privateKey) = CreateActiveKey();
        repo.KeyToReturn = key;
        var verifier = new QrSignatureVerifier(repo);

        var data = "hello world"u8.ToArray();
        var signature = privateKey.SignData(data, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

        var result = await verifier.VerifyAsync(key.Kid, data, signature, CancellationToken.None);

        Assert.True(result);
    }

    [Fact]
    public async Task VerifyAsync_TamperedData_ReturnsFalse()
    {
        var repo = new FakeSigningKeyRepository();
        var (key, privateKey) = CreateActiveKey();
        repo.KeyToReturn = key;
        var verifier = new QrSignatureVerifier(repo);

        var data = "hello world"u8.ToArray();
        var signature = privateKey.SignData(data, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);
        var tamperedData = "hello worlD"u8.ToArray();

        var result = await verifier.VerifyAsync(key.Kid, tamperedData, signature, CancellationToken.None);

        Assert.False(result);
    }

    [Fact]
    public async Task VerifyAsync_KeyNotFound_ReturnsFalse()
    {
        var repo = new FakeSigningKeyRepository();
        var verifier = new QrSignatureVerifier(repo);

        var result = await verifier.VerifyAsync("unknown-kid", "data"u8.ToArray(), new byte[64], CancellationToken.None);

        Assert.False(result);
    }

    [Fact]
    public async Task VerifyAsync_RevokedKey_ReturnsFalse()
    {
        var repo = new FakeSigningKeyRepository();
        var (key, privateKey) = CreateActiveKey(status: SigningKeyStatus.Revoked);
        repo.KeyToReturn = key;
        var verifier = new QrSignatureVerifier(repo);

        var data = "hello world"u8.ToArray();
        var signature = privateKey.SignData(data, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

        var result = await verifier.VerifyAsync(key.Kid, data, signature, CancellationToken.None);

        Assert.False(result);
    }

    [Fact]
    public async Task VerifyAsync_RetiredKey_StillVerifies()
    {
        var repo = new FakeSigningKeyRepository();
        var (key, privateKey) = CreateActiveKey(status: SigningKeyStatus.Retired);
        repo.KeyToReturn = key;
        var verifier = new QrSignatureVerifier(repo);

        var data = "hello world"u8.ToArray();
        var signature = privateKey.SignData(data, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

        var result = await verifier.VerifyAsync(key.Kid, data, signature, CancellationToken.None);

        Assert.True(result);
    }

    [Fact]
    public async Task VerifyAsync_MalformedJwkJson_ReturnsFalse()
    {
        var repo = new FakeSigningKeyRepository();
        var (key, _) = CreateActiveKey();
        key.PublicKeyJwk = "{ not valid json";
        repo.KeyToReturn = key;
        var verifier = new QrSignatureVerifier(repo);

        var result = await verifier.VerifyAsync(key.Kid, "data"u8.ToArray(), new byte[64], CancellationToken.None);

        Assert.False(result);
    }

    [Fact]
    public async Task VerifyAsync_JwkMissingXorY_ReturnsFalse()
    {
        var repo = new FakeSigningKeyRepository();
        var (key, _) = CreateActiveKey();
        key.PublicKeyJwk = JsonSerializer.Serialize(new { crv = "P-256" });
        repo.KeyToReturn = key;
        var verifier = new QrSignatureVerifier(repo);

        var result = await verifier.VerifyAsync(key.Kid, "data"u8.ToArray(), new byte[64], CancellationToken.None);

        Assert.False(result);
    }
}