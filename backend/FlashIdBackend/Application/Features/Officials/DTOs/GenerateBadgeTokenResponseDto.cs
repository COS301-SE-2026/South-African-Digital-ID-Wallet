namespace Application.Features.Officials.DTOs;

public class GenerateBadgeTokenResponseDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}