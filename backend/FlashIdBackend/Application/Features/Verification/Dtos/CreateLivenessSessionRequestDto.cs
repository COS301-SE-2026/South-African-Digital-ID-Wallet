namespace Application.Features.Verification.Dtos;

public class CreateLivenessSessionRequestDto
{
    public Guid VerificationId { get; set; }
    public string SaId { get; set; } = string.Empty;

}