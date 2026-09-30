namespace Application.Features.CertifiedCredentialCopies.DTOs;

public class VerifyCertifiedCopyDocumentResponseDto
{
    public bool IsValid { get; set; }

    public bool DocumentIntegrityValid { get; set; }

    public string Status { get; set; } = string.Empty;

    public Guid CertificationId { get; set; }

    public string CredentialType { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string IdNumber { get; set; } = string.Empty;

    public DateTime GeneratedAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public string Message { get; set; } = string.Empty;
}