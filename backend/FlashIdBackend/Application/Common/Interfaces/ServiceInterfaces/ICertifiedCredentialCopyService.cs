using Application.Features.CertifiedCredentialCopies.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ICertifiedCredentialCopyService
{
    Task<GeneratedCertifiedCopyResultDto> GenerateAsync(
        Guid credentialId,
        Guid requestingUserId);

    Task<VerifyCertifiedCopyResponseDto> VerifyAsync(
        string verificationToken);

    Task<VerifyCertifiedCopyDocumentResponseDto> VerifyDocumentAsync(
        string verificationToken,
        byte[] documentBytes);
}