using Application.Features.CertifiedCredentialCopies.Models;

namespace Application.Common.Interfaces.ProviderInterfaces;

public interface ICertifiedCopyPdfProvider
{
    byte[] Generate(CertifiedCredentialSnapshot snapshot, Guid certificationId, string verificationUrl,
        DateTime generatedAt, byte[]? photoBytes = null);
}
