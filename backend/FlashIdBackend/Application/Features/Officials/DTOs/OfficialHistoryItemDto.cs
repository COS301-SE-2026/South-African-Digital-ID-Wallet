namespace Application.Features.Officials.DTOs;

public class OfficialHistoryItemDto
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string? CitizenName { get; set; }
    public string? CitizenSaId { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
}