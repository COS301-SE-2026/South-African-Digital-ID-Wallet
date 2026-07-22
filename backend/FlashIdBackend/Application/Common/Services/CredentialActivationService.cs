using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;
using Domain.Enums;

namespace Application.Common.Services;

public class CredentialActivationService : ICredentialActivationService
{

    private readonly ICredentialRepository _credentialRepository;

    public CredentialActivationService(ICredentialRepository credentialRepository)
    {
        _credentialRepository = credentialRepository;
    }
    public async Task<ActivateCredentialsResponseDto> ActivateCredentialsAsync(ActivateCredentialsRequestDto request, Guid userId,
        string ipAddress, CancellationToken cancellationToken)
    {
        var citizen = await _credentialRepository.GetCitizenByIdAsync(userId, cancellationToken);

        if (citizen is null)
        {
            throw new InvalidOperationException("No citizen is linked to this account.");
        }

        if (citizen.Status != CitizenStatus.Verified && citizen.Status != CitizenStatus.Activated)
        {
            throw new InvalidOperationException("Citizen verification must be completed before credeentials can be activated.");
        }

        if (request.CredentialTypes is null || request.CredentialTypes.Count == 0)
        {
            throw new ArgumentNullException("At least one credential type must be selected.");
        }

        var requestedTypes = request.CredentialTypes.Distinct().ToList();


        return new ActivateCredentialsResponseDto();
    }
}