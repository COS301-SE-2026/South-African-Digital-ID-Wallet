namespace Application.Features.ActivityOverview.DTOs;

public class ActivityOverviewDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; }

    public string Type { get; set; } = string.Empty;
}