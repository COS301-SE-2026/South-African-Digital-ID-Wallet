namespace Domain.Entities;

public class ApiKeyRevealToken : BaseEntity
{
    public Guid InstitutionId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? ConsumedAt { get; set; }
    public Institution Institution { get; set; } = null!;
}