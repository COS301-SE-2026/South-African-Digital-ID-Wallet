using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class SigningKeyConfigurationTests
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

    private static SigningKey CreateKey(SigningKeyPurpose purpose, SigningKeyStatus status, string kid)
    {
        var now = DateTime.UtcNow;
        return new SigningKey
        {
            Id = Guid.NewGuid(),
            Kid = kid,
            Purpose = purpose,
            Algorithm = "ES256",
            PublicKeyJwk = "{\"crv\":\"P-256\",\"x\":\"x\",\"y\":\"y\"}",
            KeyVaultKeyName = "test-key",
            KeyVaultKeyVersion = "v1",
            Status = status,
            CreatedAt = now,
            UpdatedAt = now,
        };
    }

    [Fact]
    public async Task SecondActiveKeyForSamePurpose_ThrowsUniqueConstraintViolation()
    {
        using var context = CreateInMemoryContext();
        var ct = TestContext.Current.CancellationToken;

        context.SigningKeys.Add(CreateKey(SigningKeyPurpose.Qr, SigningKeyStatus.Active, "kid-1"));
        await context.SaveChangesAsync(ct);

        context.SigningKeys.Add(CreateKey(SigningKeyPurpose.Qr, SigningKeyStatus.Active, "kid-2"));

        await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync(ct));
    }

    [Fact]
    public async Task SecondRetiredKeyForSamePurpose_DoesNotThrow()
    {
        using var context = CreateInMemoryContext();
        var ct = TestContext.Current.CancellationToken;

        context.SigningKeys.Add(CreateKey(SigningKeyPurpose.Qr, SigningKeyStatus.Retired, "kid-1"));
        await context.SaveChangesAsync(ct);

        context.SigningKeys.Add(CreateKey(SigningKeyPurpose.Qr, SigningKeyStatus.Retired, "kid-2"));
        await context.SaveChangesAsync(ct);

        var count = await context.SigningKeys.CountAsync(k => k.Purpose == SigningKeyPurpose.Qr, ct);
        Assert.Equal(2, count);
    }

    [Fact]
    public async Task ActiveKeysForDifferentPurposes_DoesNotThrow()
    {
        using var context = CreateInMemoryContext();
        var ct = TestContext.Current.CancellationToken;

        context.SigningKeys.Add(CreateKey(SigningKeyPurpose.Qr, SigningKeyStatus.Active, "kid-qr"));
        await context.SaveChangesAsync(ct);

        context.SigningKeys.Add(CreateKey(SigningKeyPurpose.Pdf, SigningKeyStatus.Active, "kid-pdf"));
        await context.SaveChangesAsync(ct);

        var count = await context.SigningKeys.CountAsync(k => k.Status == SigningKeyStatus.Active, ct);
        Assert.Equal(2, count);
    }
}