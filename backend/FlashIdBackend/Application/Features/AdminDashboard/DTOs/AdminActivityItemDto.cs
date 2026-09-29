namespace Application.Features.AdminDashboard.DTOs;

public class AdminActivityItemDto
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}