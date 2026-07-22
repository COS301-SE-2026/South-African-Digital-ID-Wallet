namespace Application.Features.Credentials.DTOs;

public class CredentialSummaryDto
{
    public Guid Id { get; set; }
    public string CredentialType { get; set; } = string.Empty;
}