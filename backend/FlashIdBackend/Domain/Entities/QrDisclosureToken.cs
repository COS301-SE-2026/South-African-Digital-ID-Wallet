namespace Domain.Entities;

public class QrDisclosureToken : BaseEntity
{
    public Guid Jti { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public Guid CredentialId { get; set; }
    public Credential Credential { get; set; } = null!;
}