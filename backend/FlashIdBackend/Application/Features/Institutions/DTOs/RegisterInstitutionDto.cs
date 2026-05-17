using Domain.Enums;

namespace Application.Features.Institutions.DTOs;

// what the frontend sends to us
public class RegisterInstitutionRequestDto
{
    public string Name { get; set; } = string.Empty;
    public InstitutionType Type { get; set; }
    public string VerificationNumber { get; set; } = string.Empty;
    public Guid AdminId { get; set; }
}

// what we send back to the frontend
public class RegisterInstitutionResponseDto
{
    public Guid InstitutionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public Guid ApiKeyReference { get; set; }
    public string VerificationNumber { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}