namespace Application.Features.Citizens.DTOs;

public class RegisterCitizenRequestDto
{
    public string SaId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterCitizenResponseDto
{
    public Guid CitizenId { get; set; }
    public Guid UserId { get; set; }
    public string SaId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
