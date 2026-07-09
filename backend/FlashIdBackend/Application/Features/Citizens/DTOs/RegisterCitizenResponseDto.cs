namespace Application.Features.Citizens.DTOs;


public class RegisterCitizenResponseDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
