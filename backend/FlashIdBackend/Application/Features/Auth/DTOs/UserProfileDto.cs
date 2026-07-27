namespace Application.Features.Auth.DTOs;

public class UserProfileDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? SaId { get; set; }
    public string? Names { get; set; }
    public string? Surname { get; set; }
}