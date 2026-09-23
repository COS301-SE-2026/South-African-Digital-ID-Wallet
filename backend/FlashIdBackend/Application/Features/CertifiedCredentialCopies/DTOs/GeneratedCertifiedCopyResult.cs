namespace Application.Features.CertifiedCredentialCopies.DTOs;

public class GeneratedCertifiedCopyResult
{
    public Guid CertifiedCopyId { get; set; }
    public byte[] PdfBytes { get; set; } = [];
    public string FileName { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
}