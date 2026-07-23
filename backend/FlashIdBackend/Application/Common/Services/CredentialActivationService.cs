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
    private readonly ICredentialsActivationRepository _credentialsActivationRepository;

    public CredentialActivationService(ICredentialRepository credentialRepository, IGovernmentRegistryGateway governmentRegistryGateway, ICredentialsActivationRepository credentialsActivationRepository)
    {
        _credentialRepository = credentialRepository;
        _governmentRegistryGateway = governmentRegistryGateway;
        _credentialsActivationRepository = credentialsActivationRepository;
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
            throw new InvalidOperationException("Citizen verification must be completed before credentials can be activated.");
        }

        if (request.CredentialTypes is null || request.CredentialTypes.Count == 0)
        {
            throw new ArgumentNullException("At least one credential type must be selected.");
        }

        var requestedTypes = request.CredentialTypes.Distinct().ToList();
        var activatedTypes = new List<CredentialType>();
        var alreadyActivatedTypes = new List<CredentialType>();

        foreach (var credentialType in requestedTypes)
        {
            switch (credentialType)
            {
                case CredentialType.IdentityDocument:
                    {
                        var wasActivated = await AddIdAsync(citizen, cancellationToken);

                        if (wasActivated)
                        {
                            activatedTypes.Add(CredentialType.IdentityDocument);
                        }
                        else
                        {
                            alreadyActivatedTypes.Add(CredentialType.IdentityDocument);
                        }

                        break;
                    }
                case CredentialType.DriversLicense:
                    {
                        var wasActivated = await AddDriversLicenseAsync(citizen, cancellationToken);

                        if (wasActivated)
                        {
                            activatedTypes.Add(CredentialType.IdentityDocument);
                        }
                        else
                        {
                            alreadyActivatedTypes.Add(CredentialType.IdentityDocument);
                        }

                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(credentialType), credentialType, "The selected credential type is not supported.");
            }
        }

        if (activatedTypes.Count > 0)
        {
            citizen.Status = CitizenStatus.Activated;
            citizen.ActivatedAt = DateTime.UtcNow;
            await _credentialsActivationRepository.SaveChangesAsync(cancellationToken);
        }

        return new ActivateCredentialsResponseDto
        {
            Status = "Success",
            Message = BuildResponseMessage(activatedTypes, alreadyActivatedTypes),
            ActivatedCredentials = activatedTypes,
        };
    }

    private async Task<bool> AddIdAsync(Citizen citizen, CancellationToken cancellationToken)
    {
        var alreadyExists = await _credentialsActivationRepository.HasIdentityDocumentAsync(citizen.Id, cancellationToken);

        if (alreadyExists)
        {
            return false;
        }

        var id = await _governmentRegistryGateway.GetIdentityDocumentBySaIdAsync(citizen.SaId, cancellationToken);
        if (id is null)
        {
            throw new InvalidOperationException("Identity document not found.");
        }

        var credential = new Credential()
        {
            Id = Guid.NewGuid(),

            CitizenId = citizen.Id,
            Citizen = citizen,

            Status = CredentialStatus.Active,
            Signature = id.Signature,
            IssuedBy = id.IssuedBy,
            IssueDate = id.IssueDate.ToDateTime(TimeOnly.MinValue),
        };

        var identityDocument = new IdentityDocument()
        {
            Id = Guid.NewGuid(),

            CredentialId = credential.Id,
            Credential = credential,

            Citizenship = id.CountryOfBirth,
            CountryOfBirth = id.CountryOfBirth,
            Status = Enum.Parse<IdentityDocumentStatus>(id.CitizenshipStatus),
            Nationality = id.Nationality,
            PhotoPath = id.PhotoBlob,

            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        credential.IdentityDocument = identityDocument;

        await _credentialsActivationRepository.AddCredentialAsync(credential, cancellationToken);
        return true;
    }

    private async Task<bool> AddDriversLicenseAsync(Citizen citizen, CancellationToken cancellationToken)
    {
        var alreadyExists = await _credentialsActivationRepository.HasDriversLicenseAsync(citizen.Id, cancellationToken);

        if (alreadyExists)
        {
            return false;
        }

        var dL = await _governmentRegistryGateway.GetDriversLicenseBySaIdAsync(citizen.SaId, cancellationToken);
        if (dL is null)
        {
            throw new InvalidOperationException("Identity document not found.");
        }

        var credential = new Credential()
        {
            Id = Guid.NewGuid(),

            CitizenId = citizen.Id,
            Citizen = citizen,

            Status = CredentialStatus.Active,
            Signature = dL.Signature,
            IssuedBy = dL.IssuedBy,
            IssueDate = dL.IssueDate.ToDateTime(TimeOnly.MinValue),
        };

        var driversLicense = new DriversLicense()
        {
            Id = Guid.NewGuid(),

            CredentialId = credential.Id,
            Credential = credential,

            LicenseCode = Enum.Parse<LicenseCode>(dL.LicenseCode),
            LicenseNumber = dL.LicenseNumber,
            Restrictions = dL.Restrictions,
            ExpiryDate = dL.ExpiryDate.ToDateTime(TimeOnly.MinValue),
            PhotoPath = dL.PhotoBlob,

            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        credential.DriversLicense = driversLicense;

        await _credentialsActivationRepository.AddCredentialAsync(credential, cancellationToken);
        return true;
    }

    private static string BuildResponseMessage(IReadOnlyCollection<CredentialType> activatedTypes, IReadOnlyCollection<CredentialType> alreadyActivatedTypes)
    {
        if (activatedTypes.Count > 0 && alreadyActivatedTypes.Count == 0)
        {
            return "The selected credentials were activated successfully.";
        }

        if (activatedTypes.Count == 0 && alreadyActivatedTypes.Count > 0)
        {
            return "The selected credentials were already activated.";
        }

        return "Some credentials were activated successfully, while others were already active.";
    }
}