using Application.Features.Credentials.Enums;

namespace Application.Features.Credentials.DTOs;

public class ActivateCredentialsRequestDto
{
    public List<CredentialType> CredentialTypes { get; set; } = [];
}