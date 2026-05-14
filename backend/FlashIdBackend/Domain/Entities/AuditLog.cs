using Domain.Enums;

namespace Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; }

    public AuditEventType EventType { get; set; }

    public string Details { get; set; } = string.Empty;

    public string IpAddress { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    // navigation properties
    public Guid ActorId { get; set; }
    public User Actor { get; set; } = null!;
}