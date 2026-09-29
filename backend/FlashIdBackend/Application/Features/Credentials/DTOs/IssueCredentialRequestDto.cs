using Application.Features.Credentials.Enums;

namespace Application.Features.Credentials.DTOs;

public class IssueCredentialRequestDto
{
    public string SaId { get; set; } = string.Empty;
    public CredentialType CredentialType { get; set; }
    public bool ConsentGiven { get; set; }
}
