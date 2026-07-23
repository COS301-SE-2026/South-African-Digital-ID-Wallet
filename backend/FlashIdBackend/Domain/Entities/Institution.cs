using Domain.Enums;

namespace Domain.Entities;

public class Institution : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public InstitutionType Type { get; set; }

    // store KeyVault reference GUID rather than raw secret
    public Guid ApiKeyReference { get; set; }

    // SHA-256 hash of the current active API key, never the plaintext value
    public string ApiKeyHash { get; set; } = string.Empty;
    public string VerificationNumber { get; set; } = string.Empty;

    public string ContactEmail { get; set; } = string.Empty;

    // navigation properties
    public Guid RegisteredById { get; set; }
    public GovernmentAdministrator RegisteredBy { get; set; } = null!;

    public ICollection<Official> Officials { get; set; } = new List<Official>();
}