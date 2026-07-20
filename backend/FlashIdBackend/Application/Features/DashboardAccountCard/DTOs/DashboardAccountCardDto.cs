namespace Application.Features.DashboardAccountCard.DTOs;

public class DashboardAccountCardDto
{
    public Guid UserId { get; set; }

    public string Names { get; set; } = string.Empty;

    public string Surname { get; set; } = string.Empty;

    public string Citizenship { get; set; } = string.Empty;
}