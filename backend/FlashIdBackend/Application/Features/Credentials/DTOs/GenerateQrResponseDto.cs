namespace Application.Features.Credentials.DTOs;

public class GenerateQrResponseDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}