using Application.Features.CertifiedCredentialCopies.Models;

namespace Application.Common.Interfaces.ProviderInterfaces;

public interface ICertifiedCopyCryptographyProvider
{
    string GenerateVerificationToken();

    string HashVerificationToken(string token);

    string HashCredentialSnapshot(CertifiedCredentialSnapshot snapshot);

    string HashDocument(byte[] documentBytes);

    bool VerifyDocumentHash(byte[] documentBytes, string expectedHash);
}