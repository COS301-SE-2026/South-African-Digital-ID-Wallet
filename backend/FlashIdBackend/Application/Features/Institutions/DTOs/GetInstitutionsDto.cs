namespace Application.Features.Institutions.DTOs;

public class GetInstitutionResponseDto
{
    public Guid InstitutionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string VerificationNumber { get; set; } = string.Empty;
    public Guid RegisteredById { get; set; }
    public DateTime CreatedAt { get; set; }
}