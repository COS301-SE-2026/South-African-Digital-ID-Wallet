namespace Application.Features.Onboarding.Dtos;

public class VerifiedCitizenRecordResponse
{
    public string SaId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public bool IsVerified { get; set; }
}