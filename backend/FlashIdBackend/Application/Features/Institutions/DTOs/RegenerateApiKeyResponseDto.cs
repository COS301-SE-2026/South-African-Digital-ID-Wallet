namespace Application.Features.Institutions.DTOs;

public class RegenerateApiKeyResponseDto
{
    public Guid InstitutionId { get; set; }
    public string ApiKey { get; set; } = string.Empty;
    public DateTime RegeneratedAt { get; set; }
}