using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;

namespace Application.Common.Services;

public class CredentialActivationService : ICredentialActivationService
{
    public Task<ActivateCredentialsResponseDto> ActivateCredentialsAsync(ActivateCredentialsRequestDto request, Guid userId,
        string ipAddress, CancellationToken cancellationToken)
    {
        return null;
    }
}