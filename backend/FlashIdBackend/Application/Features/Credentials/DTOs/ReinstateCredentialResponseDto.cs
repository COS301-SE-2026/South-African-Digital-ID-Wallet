using Domain.Enums;

namespace Application.Features.Credentials.DTOs;

public class ReinstateCredentialResponseDto
{
    public Guid CredentialId { get; set; }
    public CredentialStatus Status { get; set; }
    public DateTime UpdatedAt { get; set; }
}