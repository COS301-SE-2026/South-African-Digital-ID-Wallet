using Domain.Enums;

namespace Application.Features.Credentials.DTOs;

public class RevokeCredentialRequestDto
{
    public CredentialStatus NewStatus { get; set; }
    public string Reason { get; set; } = string.Empty;
}

