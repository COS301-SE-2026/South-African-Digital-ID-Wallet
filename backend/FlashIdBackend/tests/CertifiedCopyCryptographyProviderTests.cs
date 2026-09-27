using Application.Features.CertifiedCredentialCopies.Models;
using Infrastructure.Providers;

namespace tests;

public class CertifiedCopyCryptographyProviderTests
{
    private readonly CertifiedCopyCryptographyProvider _provider = new();

    [Fact]
    public void GenerateVerificationToken_ReturnsNonEmptyToken()
    {
        var token = _provider.GenerateVerificationToken();

        Assert.False(string.IsNullOrWhiteSpace(token));
    }

    [Fact]
    public void GenerateVerificationToken_CalledTwice_ReturnsDifferentTokens()
    {
        var first = _provider.GenerateVerificationToken();

        var second = _provider.GenerateVerificationToken();

        Assert.NotEqual(first, second);
    }

    [Fact]
    public void HashVerificationToken_SameToken_ReturnsSameHash()
    {
        const string token = "test-token";

        var first = _provider.HashVerificationToken(token);

        var second = _provider.HashVerificationToken(token);

        Assert.Equal(first, second);
    }
    
    [Fact]
    public void HashVerificationToken_DifferentTokens_ReturnDifferentHashes()
    {
        var first = _provider.HashVerificationToken("token-one");

        var second = _provider.HashVerificationToken("token-two");

        Assert.NotEqual(first, second);
    }

    [Fact]
    public void HashVerificationToken_ReturnsSha256HexLength()
    {
        var hash = _provider.HashVerificationToken("test-token");

        Assert.Equal(64, hash.Length);
    }

    [Fact]
    public void HashDocument_SameBytes_ReturnsSameHash()
    {
        var bytes = "same document"u8.ToArray();

        var first = _provider.HashDocument(bytes);

        var second = _provider.HashDocument(bytes);

        Assert.Equal(first, second);
    }
    
    [Fact]
    public void HashDocument_ChangedBytes_ReturnsDifferentHash()
    {
        var original = "original document"u8.ToArray();

        var modified = "modified document"u8.ToArray();

        var originalHash = _provider.HashDocument(original);

        var modifiedHash = _provider.HashDocument(modified);

        Assert.NotEqual(originalHash, modifiedHash);
    }

    [Fact]
    public void VerifyDocumentHash_OriginalDocument_ReturnsTrue()
    {
        var document = "%PDF-original"u8.ToArray();

        var hash = _provider.HashDocument(document);

        var result = _provider.VerifyDocumentHash(document, hash);

        Assert.True(result);
    }

    [Fact]
    public void VerifyDocumentHash_ModifiedDocument_ReturnsFalse()
    {
        var original = "%PDF-original"u8.ToArray();

        var modified = "%PDF-modified"u8.ToArray();

        var originalHash = _provider.HashDocument(original);

        var result = _provider.VerifyDocumentHash(modified, originalHash);

        Assert.False(result);
    }

    [Fact]
    public void VerifyDocumentHash_InvalidExpectedHash_ReturnsFalse()
    {
        var document = "%PDF-document"u8.ToArray();

        var result = _provider.VerifyDocumentHash(document, "NOT-A-VALID-HASH");

        Assert.False(result);
    }

    [Fact]
    public void HashCredentialSnapshot_SameSnapshot_ReturnsSameHash()
    {
        var snapshot = CreateSnapshot();

        var first = _provider.HashCredentialSnapshot(snapshot);

        var second = _provider.HashCredentialSnapshot(snapshot);

        Assert.Equal(first, second);
    }

    [Fact]
    public void HashCredentialSnapshot_ChangedCredentialData_ChangesHash()
    {
        var original = CreateSnapshot();

        var changed = CreateSnapshot();

        changed.FullName = "Different Person";

        var originalHash = _provider.HashCredentialSnapshot(original);

        var changedHash = _provider.HashCredentialSnapshot(changed);

        Assert.NotEqual(originalHash, changedHash);
    }

    private static CertifiedCredentialSnapshot CreateSnapshot()
    {
        return new CertifiedCredentialSnapshot
        {
            CredentialId = Guid.Parse("11111111-1111-1111-1111-111111111111"),

            CredentialType = "IdentityDocument",
            IssuedBy = "Department of Home Affairs",

            IssueDate = new DateTime(2026, 1, 1),

            FullName = "Kayla Patel",
            IdNumber = "9000000000000",

            DateOfBirth = new DateTime(1990, 1, 1),

            Citizenship = "South African",
            CountryOfBirth = "South Africa",
            Nationality = "South African"
        };
    }
}