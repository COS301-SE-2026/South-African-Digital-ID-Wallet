using Domain.Enums;

namespace Domain.Entities;

public class Institution : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public InstitutionType Type { get; set; }

    // store KeyVault reference GUID rather than raw secret
    public Guid ApiKeyReference { get; set; }

    public string VerificationNumber { get; set; } = string.Empty;

    // navigation properties
    public Guid RegisteredById { get; set; }
    public GovernmentAdministrator RegisteredBy { get; set; } = null!;

    public ICollection<Official> Officials { get; set; } = new List<Official>();
}