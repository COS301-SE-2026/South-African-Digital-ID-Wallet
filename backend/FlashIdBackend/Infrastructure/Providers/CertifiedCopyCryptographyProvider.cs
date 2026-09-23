using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.CertifiedCredentialCopies.Models;
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

    public string HashCredentialSnapshot(CertifiedCredentialSnapshot snapshot)
    {
        ArgumentNullException.ThrowIfNull(snapshot);
        var canonicalSnapshot = CreateCanonicalSnapshot(snapshot);
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
        ArgumentNullException.ThrowIfNull(documentBytes);
        ArgumentException.ThrowIfNullOrWhiteSpace(expectedHash);

        if (documentBytes.Length == 0)
        {
            return false;
        }

        var actualHashBytes = SHA256.HashData(documentBytes);

        byte[] expectedHashBytes;

        try
        {
            expectedHashBytes = Convert.FromHexString(expectedHash);
        }
        catch (FormatException)
        {
            return false;
        }

        if (actualHashBytes.Length != expectedHashBytes.Length)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(
            actualHashBytes,
            expectedHashBytes);
    }

    private static string CreateCanonicalSnapshot(CertifiedCredentialSnapshot snapshot)
    {
        return string.Join("|",
            $"credentialId={snapshot.CredentialId:D}",
            $"credentialType={Normalize(snapshot.CredentialType)}",
            $"issuedBy={Normalize(snapshot.IssuedBy)}",
            $"issueDate={FormatDate(snapshot.IssueDate)}",
            $"fullName={Normalize(snapshot.FullName)}",
            $"idNumber={Normalize(snapshot.IdNumber)}",
            $"dateOfBirth={FormatNullableDate(snapshot.DateOfBirth)}",
            $"citizenship={Normalize(snapshot.Citizenship)}",
            $"countryOfBirth={Normalize(snapshot.CountryOfBirth)}",
            $"nationality={Normalize(snapshot.Nationality)}",
            $"licenseNumber={Normalize(snapshot.LicenseNumber)}",
            $"licenseCode={Normalize(snapshot.LicenseCode)}",
            $"restrictions={Normalize(snapshot.Restrictions)}",
            $"expiryDate={FormatNullableDate(snapshot.ExpiryDate)}",
            $"countryOfIssue={Normalize(snapshot.CountryOfIssue)}"
        );
    }

    private static string Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        return value.Trim()
            .Replace("\\", "\\\\")
            .Replace("|", "\\|")
            .Replace("=", "\\=");
    }

    private static string ComputeSha256Hash(byte[] data)
    {
        var hashBytes = SHA256.HashData(data);
        return Convert.ToHexString(hashBytes);
    }

    private static string FormatDate(DateTime value)
    {
        return value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }

    private static string FormatNullableDate(DateTime? value)
    {
        return value?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) ?? string.Empty;
    }
}