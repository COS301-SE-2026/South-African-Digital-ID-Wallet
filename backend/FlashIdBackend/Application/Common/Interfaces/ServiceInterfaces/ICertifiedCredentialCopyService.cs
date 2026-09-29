using Application.Features.CertifiedCredentialCopies.DTOs;
using Application.Features.Credentials.Enums;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ICertifiedCredentialCopyService
{
    Task<GeneratedCertifiedCopyResultDto> GenerateAsync(
        Guid credentialId,
        CredentialType credentialType,
        Guid requestingUserId);

    Task<VerifyCertifiedCopyResponseDto> VerifyAsync(
        string verificationToken);

    Task<VerifyCertifiedCopyDocumentResponseDto> VerifyDocumentAsync(
        string verificationToken,
        byte[] documentBytes);

    Task<VerifyCertifiedCopyDocumentResponseDto> VerifyDocumentAsync(
        byte[] documentBytes);
}