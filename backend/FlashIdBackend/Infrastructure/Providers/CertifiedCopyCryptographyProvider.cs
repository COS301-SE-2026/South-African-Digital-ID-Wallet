using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.AspNetCore.WebUtilities;

namespace Infrastructure.Providers;

public class CertifiedCopyCryptographyProvider : ICertifiedCopyCryptographyProvider
{
    private const int VerificationTokenSize = 32;

    public string GenerateVerificationToken()
    {
        var tokenBytes = RandomNumberGenerator.GetBytes(VerificationTokenSize);
        return WebEncoders.Base64UrlEncode(tokenBytes);
    }

    public string HashVerificationToken(string token)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(token);
        var tokenBytes = Encoding.UTF8.GetBytes(token);
        return ComputeSha256Hash(tokenBytes);
    }

    public string HashCredentialSnapshot(string canonicalSnapshot)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(canonicalSnapshot);
        var snapshotBytes = Encoding.UTF8.GetBytes(canonicalSnapshot);
        return ComputeSha256Hash(snapshotBytes);
    }

    public string HashDocument(byte[] documentBytes)
    {
        ArgumentNullException.ThrowIfNull(documentBytes);

        if (documentBytes.Length == 0)
        {
            throw new ArgumentException("Document cannot be empty.", nameof(documentBytes));
        }

        return ComputeSha256Hash(documentBytes);
    }

    public bool VerifyDocumentHash(byte[] documentBytes, string expectedHash)
    {
        return false;
    }

    private static string ComputeSha256Hash(byte[] data)
    {
        var hashBytes = SHA256.HashData(data);
        return Convert.ToHexString(hashBytes);
    }
}