using Application.Features.Credentials.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface ICredentialActivationService
{
    Task<ActivateCredentialsResponseDto> ActivateCredentialsAsync(ActivateCredentialsRequestDto request, Guid userId, string ipAddress, CancellationToken cancellationToken);
}