using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text;
using Application.Common.Services;

namespace tests;

public class EmergencyCodeVerifierTests
{
    private static readonly byte[] Context = Encoding.ASCII.GetBytes("FIDEMG1");

    private static byte[] Handle() => Enumerable.Range(0, 16).Select(i => (byte)i).ToArray();

    private static byte[] SignedBytes(byte[] handle, DateTimeOffset issuedAt)
    {
        var signed = new byte[Context.Length + 20];
        Context.CopyTo(signed, 0);
        handle.CopyTo(signed, Context.Length);
        BinaryPrimitives.WriteUInt32BigEndian(
            signed.AsSpan(Context.Length + 16, 4), (uint)issuedAt.ToUnixTimeSeconds());
        return signed;
    }

    private static string BuildCode(ECDsa signer, byte[] handle, DateTimeOffset issuedAt)
    {
        var signature = signer.SignData(
            SignedBytes(handle, issuedAt),
            HashAlgorithmName.SHA256,
            DSASignatureFormat.Rfc3279DerSequence);

        var ts = new byte[4];
        BinaryPrimitives.WriteUInt32BigEndian(ts, (uint)issuedAt.ToUnixTimeSeconds());

        return "https://flashid.co.za/e#1."
             + $"{Base64Url.Encode(handle)}.{Base64Url.Encode(ts)}.{Base64Url.Encode(signature)}";
    }

    [Fact]
    public void TryParse_ValidCode_ReturnsHandleAndTimestamp()
    {
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var issuedAt = DateTimeOffset.FromUnixTimeSeconds(1_780_000_000);

        Assert.True(EmergencyCodeVerifier.TryParse(BuildCode(key, Handle(), issuedAt), out var code));
        Assert.Equal(Handle(), code.Handle);
        Assert.Equal(issuedAt, code.IssuedAt);
    }

    [Fact]
    public void TryParse_PayloadWithoutUrlPrefix_StillParses()
    {
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var full = BuildCode(key, Handle(), DateTimeOffset.UtcNow);
        var payload = full[(full.IndexOf('#') + 1)..];

        Assert.True(EmergencyCodeVerifier.TryParse(payload, out _));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not-a-code")]
    [InlineData("1.only.three")]
    [InlineData("1.a.b.c.d")]
    public void TryParse_Malformed_ReturnsFalse(string raw)
    {
        Assert.False(EmergencyCodeVerifier.TryParse(raw, out _));
    }

    [Fact]
    public void TryParse_NullInput_ReturnsFalse()
    {
        Assert.False(EmergencyCodeVerifier.TryParse(null!, out _));
    }

    [Fact]
    public void TryParse_UnknownVersion_ReturnsFalse()
    {
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var code = BuildCode(key, Handle(), DateTimeOffset.UtcNow).Replace("#1.", "#2.");

        Assert.False(EmergencyCodeVerifier.TryParse(code, out _));
    }

    [Fact]
    public void TryParse_WrongHandleLength_ReturnsFalse()
    {
        var shortHandle = new byte[15];
        var ts = new byte[4];
        var raw = $"1.{Base64Url.Encode(shortHandle)}.{Base64Url.Encode(ts)}.{Base64Url.Encode(new byte[8])}";

        Assert.False(EmergencyCodeVerifier.TryParse(raw, out _));
    }

    [Fact]
    public void TryParse_WrongTimestampLength_ReturnsFalse()
    {
        var raw = $"1.{Base64Url.Encode(Handle())}.{Base64Url.Encode(new byte[8])}.{Base64Url.Encode(new byte[8])}";

        Assert.False(EmergencyCodeVerifier.TryParse(raw, out _));
    }

    [Fact]
    public void TryParse_UndecodableBase64_ReturnsFalse()
    {
        Assert.False(EmergencyCodeVerifier.TryParse("1.!!!!.!!!!.!!!!", out _));
    }

    [Fact]
    public void IsFresh_WithinSkew_ReturnsTrue()
    {
        var now = DateTimeOffset.UtcNow;
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        EmergencyCodeVerifier.TryParse(BuildCode(key, Handle(), now.AddMinutes(-2)), out var code);

        Assert.True(EmergencyCodeVerifier.IsFresh(code, now));
    }

    [Fact]
    public void IsFresh_TooOld_ReturnsFalse()
    {
        var now = DateTimeOffset.UtcNow;
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        EmergencyCodeVerifier.TryParse(BuildCode(key, Handle(), now.AddMinutes(-4)), out var code);

        Assert.False(EmergencyCodeVerifier.IsFresh(code, now));
    }

    [Fact]
    public void IsFresh_TooFarInFuture_ReturnsFalse()
    {
        var now = DateTimeOffset.UtcNow;
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        EmergencyCodeVerifier.TryParse(BuildCode(key, Handle(), now.AddMinutes(4)), out var code);

        Assert.False(EmergencyCodeVerifier.IsFresh(code, now));
    }

    [Fact]
    public void VerifySignature_CorrectKey_ReturnsTrue()
    {
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        EmergencyCodeVerifier.TryParse(BuildCode(key, Handle(), DateTimeOffset.UtcNow), out var code);

        Assert.True(EmergencyCodeVerifier.VerifySignature(code, key.ExportSubjectPublicKeyInfo()));
    }

    [Fact]
    public void VerifySignature_DifferentDeviceKey_ReturnsFalse()
    {
        using var signer = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        using var attacker = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        EmergencyCodeVerifier.TryParse(BuildCode(signer, Handle(), DateTimeOffset.UtcNow), out var code);

        Assert.False(EmergencyCodeVerifier.VerifySignature(code, attacker.ExportSubjectPublicKeyInfo()));
    }

    [Fact]
    public void VerifySignature_TamperedHandle_ReturnsFalse()
    {
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        EmergencyCodeVerifier.TryParse(BuildCode(key, Handle(), DateTimeOffset.UtcNow), out var code);

        var tampered = (byte[])code.Handle.Clone();
        tampered[0] ^= 0xFF;
        var forged = new EmergencyCodeVerifier.ParsedCode(tampered, code.IssuedAt, code.Signature);

        Assert.False(EmergencyCodeVerifier.VerifySignature(forged, key.ExportSubjectPublicKeyInfo()));
    }

    [Fact]
    public void VerifySignature_GarbagePublicKey_ReturnsFalseInsteadOfThrowing()
    {
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        EmergencyCodeVerifier.TryParse(BuildCode(key, Handle(), DateTimeOffset.UtcNow), out var code);

        Assert.False(EmergencyCodeVerifier.VerifySignature(code, new byte[] { 1, 2, 3 }));
    }
}
