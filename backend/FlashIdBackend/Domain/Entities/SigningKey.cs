using Domain.Enums;

namespace Domain.Entities;

public class SigningKey : BaseEntity
{
    public string Kid { get; set; } = string.Empty;
    public SigningKeyPurpose Purpose { get; set; }
    public string Algorithm { get; set; } = "ES256";
    public string PublicKeyJwk { get; set; } = string.Empty;
    public string KeyVaultKeyName { get; set; } = string.Empty;
    public string KeyVaultKeyVersion { get; set; } = string.Empty;
    public SigningKeyStatus Status { get; set; } = SigningKeyStatus.Active;
    public DateTime? RetiredAt { get; set; }
    public DateTime? RevokedAt { get; set; }
}