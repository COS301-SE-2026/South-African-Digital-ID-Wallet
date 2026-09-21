using Domain.Enums;

namespace Domain.Entities;

public class Credential : BaseEntity
{
    public CredentialStatus Status { get; set; }

    public string Signature { get; set; } = string.Empty;

    public string IssuedBy { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }

    // navigation properties
    public Guid CitizenId { get; set; }
    public Citizen Citizen { get; set; } = null!;

    // one credential is either an IdentityDocument or a DriversLicense
    public IdentityDocument? IdentityDocument { get; set; }
    public DriversLicense? DriversLicense { get; set; }
    public Biometrics? Biometrics { get; set; }

    public string? IdFrontImagePath { get; set; }

    public string? IdBackImagePath { get; set; }

    public string? SelfieImagePath { get; set; }

    // Offline package. All null until the wallet first asks for an offline credential
    public string? IssuerSignedCredential { get; set; }

    // JSON array of every disclosure, so a presentation can be assembled without re-signing.
    public string? DisclosureSet { get; set; }

    public string? SigningKid { get; set; }

    // Which device key the cnf claim binds to, so a new phone triggers a re-mint.
    public string? HolderKeyThumbprint { get; set; }

    public DateTimeOffset? SignedAt { get; set; }

    public DateTimeOffset? PackageExpiresAt { get; set; }

    // The only credential identifier inside a presentation. Allocated at 1st mint
    public int? RevocationIndex { get; set; }
}
