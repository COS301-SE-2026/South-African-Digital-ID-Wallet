namespace Domain.Entities;

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid FamilyId { get; set; }

    public string TokenHash { get; set; } = string.Empty;

    public int TokenVersion { get; set; }

    public bool RememberMe { get; set; }

    public DateTime ExpiresAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public Guid? ReplacedByTokenId { get; set; }

    public User User { get; set; } = null!;
}
