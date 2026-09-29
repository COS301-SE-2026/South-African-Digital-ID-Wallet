namespace Application.Features.Verification.Dtos;

public class VerificationRequestDto
{
    public string Token { get; set; } = string.Empty;
    public string SaId { get; set; } = string.Empty;
    public string Pin { get; set; } = string.Empty;
}