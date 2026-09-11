using Domain.Enums;

namespace Domain.Entities;

public class CertifiedCredentialCopy
{
    public Guid Id { get; set; }
    public Guid CitizenId { get; set; }
    public Guid CredentialId { get; set; }
    public string VerificationTokenHash { get; set; } = null;
    public string CredentialSnapshotHash { get; set; } = null;
    public DateTime GeneratedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public Credential Credential { get; set; }
    public CertifiedCopyStatus Status { get; set; }
}