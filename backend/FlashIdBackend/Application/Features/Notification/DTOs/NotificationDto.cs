namespace Application.Features.Notifications.DTOs;

public class NotificationDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Tone { get; set; } = string.Empty;
}