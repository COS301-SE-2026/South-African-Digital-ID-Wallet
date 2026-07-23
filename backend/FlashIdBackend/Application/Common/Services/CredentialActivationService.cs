using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Enums;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class CredentialActivationService : ICredentialActivationService
{

    private readonly ICredentialRepository _credentialRepository;
    private readonly IGovernmentRegistryGateway _governmentRegistryGateway;

    public CredentialActivationService(ICredentialRepository credentialRepository, IGovernmentRegistryGateway governmentRegistryGateway)
    {
        _credentialRepository = credentialRepository;
        _governmentRegistryGateway = governmentRegistryGateway;
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

        var saId = citizen.SaId;

        foreach (var credentialType in requestedTypes)
        {
            switch (credentialType)
            {
                case CredentialType.IdentityDocument:

                    break;
                case CredentialType.DriversLicense:
                    break;
            }

        }


        return new ActivateCredentialsResponseDto();
    }

    private async Task GetIDAsync(string saId, Citizen citizen, CancellationToken cancellationToken)
    {
        var id = await _governmentRegistryGateway.GetIdentityDocumentBySaIdAsync(saId, cancellationToken);
        if (id is null)
        {
            throw new InvalidOperationException("Identity document not found.");
        }

        var identityDocument = new IdentityDocument()
        {
            Id = new Guid(),

        };
    }
}