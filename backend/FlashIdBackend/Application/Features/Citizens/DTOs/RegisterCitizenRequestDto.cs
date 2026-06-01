namespace Application.Features.Citizens.DTOs;

public class RegisterCitizenRequestDto
{
    public string SaId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ActivationCode { get; set; } = string.Empty;
}