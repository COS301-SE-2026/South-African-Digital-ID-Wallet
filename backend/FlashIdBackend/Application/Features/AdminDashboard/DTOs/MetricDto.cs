namespace Application.Features.AdminDashboard.DTOs;

public class MetricDto
{
    public int Value { get; set; }
    public double? ChangePct { get; set; }
    public List<DailyPointDto> Series { get; set; } = new();
}
