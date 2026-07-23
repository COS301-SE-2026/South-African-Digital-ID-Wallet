namespace Application.Features.Institutions.DTOs;

public class RegisterInstitutionResponseDto
{
    public Guid InstitutionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public Guid ApiKeyReference { get; set; }
    public string VerificationNumber { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}