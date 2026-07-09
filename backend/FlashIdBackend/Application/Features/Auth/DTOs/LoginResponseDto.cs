namespace Application.Features.Auth.DTOs;

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Names { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
}