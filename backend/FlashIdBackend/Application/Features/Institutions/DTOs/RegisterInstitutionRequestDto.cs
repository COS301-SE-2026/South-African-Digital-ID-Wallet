using Domain.Enums;

namespace Application.Features.Institutions.DTOs;

public class RegisterInstitutionRequestDto
{
    public string Name { get; set; } = string.Empty;
    public InstitutionType Type { get; set; }
    public string VerificationNumber { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public Guid AdminId { get; set; }
}