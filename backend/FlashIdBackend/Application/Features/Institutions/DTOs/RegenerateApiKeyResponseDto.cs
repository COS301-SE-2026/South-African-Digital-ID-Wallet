namespace Application.Features.Institutions.DTOs;

public class RegenerateApiKeyResponseDto
{
    public Guid InstitutionId { get; set; }
    public DateTime RegeneratedAt { get; set; }
}