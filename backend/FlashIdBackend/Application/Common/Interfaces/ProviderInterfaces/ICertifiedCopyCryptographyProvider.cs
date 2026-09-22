namespace Application.Common.Interfaces.ProviderInterfaces;

public interface ICertifiedCopyCryptographyProvider
{
    string GenerateVerificationToken();

    string HashVerificationToken(string token);

    string HashCredentialSnapshot(string canonicalSnapshot);

    string HashDocument(byte[] documentBytes);

    bool VerifyDocumentHash(byte[] documentBytes, string expectedHash);
}