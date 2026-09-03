namespace Application.Features.Credentials.DTOs;

public class SearchCitizensResponseDto
{
    public List<CitizenSearchResultDto> Results { get; set; } = new();
    public int TotalResults { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class CitizenSearchResultDto
{
    public Guid CitizenId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string IdNumber { get; set; } = string.Empty;
    public DateTime? DateJoined { get; set; }
    public DateTime? ExpiresOn { get; set; }
}