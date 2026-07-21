namespace Application.Features.Verification.Dtos;

public class VerificationResponseDto
{
    public Guid CitizenId { get; set; }

    public string Status { get; set; } = string.Empty;

    public bool IsVerified { get; set; }

    public string Message { get; set; } = string.Empty;

}