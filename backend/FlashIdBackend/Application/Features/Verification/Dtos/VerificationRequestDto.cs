namespace Application.Features.Verification.Dtos;

public class VerificationRequestDto
{
    public string token { get; set; } = string.Empty;
    public string saId { get; set; } = string.Empty;
    public string pin { get; set; } = string.Empty;
}