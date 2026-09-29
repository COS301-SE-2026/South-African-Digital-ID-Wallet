namespace Application.Features.Officials.DTOs;

public class MyActivityItemDto
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}