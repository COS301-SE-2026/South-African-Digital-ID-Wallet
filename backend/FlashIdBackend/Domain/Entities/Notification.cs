namespace Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }

    public Guid CitizenId { get; set; }

    public Citizen Citizen { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Tone { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsRead { get; set; }
}