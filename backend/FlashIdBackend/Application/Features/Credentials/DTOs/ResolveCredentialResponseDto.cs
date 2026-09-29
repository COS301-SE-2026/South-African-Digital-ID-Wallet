namespace Application.Features.Credentials.DTOs;

public class ResolveCredentialResponseDto
{
    public string CredentialType { get; set; } = string.Empty;
    public Dictionary<string, string> DisclosedFields { get; set; } = new();
}