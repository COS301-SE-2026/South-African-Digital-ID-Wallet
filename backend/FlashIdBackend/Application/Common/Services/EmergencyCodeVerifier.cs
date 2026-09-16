using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text;

namespace Application.Common.Services;

public static class EmergencyCodeVerifier
{
    private const string Version = "1";
    private static readonly byte[] Context = Encoding.ASCII.GetBytes("FIDEMG1");
    public static readonly TimeSpan MaxSkew = TimeSpan.FromMinutes(3);

    public readonly record struct ParsedCode(byte[] Handle, DateTimeOffset IssuedAt, byte[] Signature);

    public static bool TryParse(string raw, out ParsedCode code)
    {
        code = default;
        if (string.IsNullOrWhiteSpace(raw)) return false;

        var hash = raw.IndexOf('#');
        var payload = hash >= 0 ? raw[(hash + 1)..] : raw;

        var parts = payload.Split('.');
        if (parts.Length != 4 || parts[0] != Version) return false;

        try
        {
            var handle = Base64Url.Decode(parts[1]);
            var tsBytes = Base64Url.Decode(parts[2]);
            var signature = Base64Url.Decode(parts[3]);

            if (handle.Length != 16 || tsBytes.Length != 4) return false;

            var seconds = BinaryPrimitives.ReadUInt32BigEndian(tsBytes);
            code = new ParsedCode(handle, DateTimeOffset.FromUnixTimeSeconds(seconds), signature);
            return true;
        }
        catch (FormatException) { return false; }
    }

    public static bool IsFresh(ParsedCode code, DateTimeOffset now) =>
        (now - code.IssuedAt).Duration() <= MaxSkew;

    public static bool VerifySignature(ParsedCode code, byte[] publicKeySpki)
    {
        var signed = new byte[Context.Length + 20];
        Context.CopyTo(signed, 0);
        code.Handle.CopyTo(signed, Context.Length);
        BinaryPrimitives.WriteUInt32BigEndian(
            signed.AsSpan(Context.Length + 16, 4),
            (uint)code.IssuedAt.ToUnixTimeSeconds());

        try
        {
            using var ecdsa = ECDsa.Create();
            ecdsa.ImportSubjectPublicKeyInfo(publicKeySpki, out _);

            return ecdsa.VerifyData(
                signed, code.Signature,
                HashAlgorithmName.SHA256,
                DSASignatureFormat.Rfc3279DerSequence);
        }
        catch (CryptographicException)
        {
            return false;
        }
    }
}

public static class Base64Url
{
    public static byte[] Decode(string s)
    {
        var padded = s.Replace('-', '+').Replace('_', '/');
        return Convert.FromBase64String(padded.PadRight((padded.Length + 3) / 4 * 4, '='));
    }

    public static string Encode(ReadOnlySpan<byte> bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}