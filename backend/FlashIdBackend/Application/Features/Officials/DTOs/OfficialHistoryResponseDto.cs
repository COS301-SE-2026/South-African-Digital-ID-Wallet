namespace Application.Features.Officials.DTOs;

public class OfficialHistoryResponseDto
{
    public List<OfficialHistoryItemDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}