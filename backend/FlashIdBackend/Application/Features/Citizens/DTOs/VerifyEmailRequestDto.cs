namespace Application.Features.Citizens.DTOs;

public class VerifyEmailRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string OTP { get; set; } = string.Empty;
}