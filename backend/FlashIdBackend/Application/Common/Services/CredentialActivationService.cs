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
    private readonly List<CredentialType> _activatedTypes = new List<CredentialType>();
    private readonly List<CredentialType> _alreadyActivatedTypes = new List<CredentialType>();
    private readonly List<CredentialType> _unavailableTypes = new List<CredentialType>();

    public CredentialActivationService(ICredentialRepository credentialRepository, IGovernmentRegistryGateway governmentRegistryGateway, ICredentialsActivationRepository credentialsActivationRepository)
    {
        _credentialRepository = credentialRepository;
        _governmentRegistryGateway = governmentRegistryGateway;
        _credentialsActivationRepository = credentialsActivationRepository;
    }

    public async Task<ActivateCredentialsResponseDto> ActivateCredentialsAsync(ActivateCredentialsRequestDto request, Guid userId,
        string ipAddress, CancellationToken cancellationToken)
    {
        _activatedTypes.Clear();
        _alreadyActivatedTypes.Clear();
        _unavailableTypes.Clear();

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


        foreach (var credentialType in requestedTypes)
        {
            switch (credentialType)
            {
                case CredentialType.IdentityDocument:
                    {
                        var wasActivated = await AddIdAsync(citizen, cancellationToken);

                        if (wasActivated)
                        {
                            _activatedTypes.Add(CredentialType.IdentityDocument);
                        }

                        break;
                    }
                case CredentialType.DriversLicense:
                    {
                        var wasActivated = await AddDriversLicenseAsync(citizen, cancellationToken);

                        if (wasActivated)
                        {
                            _activatedTypes.Add(CredentialType.DriversLicense);
                        }

                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(credentialType), credentialType, "The selected credential type is not supported.");
            }
        }

        if (_activatedTypes.Count > 0)
        {
            citizen.Status = CitizenStatus.Activated;
            citizen.ActivatedAt ??= DateTime.UtcNow;
            await _credentialsActivationRepository.SaveChangesAsync(cancellationToken);
        }

        return new ActivateCredentialsResponseDto
        {
            Status = "Success",
            Message = BuildResponseMessage(),
        };
    }

    private async Task<bool> AddIdAsync(Citizen citizen, CancellationToken cancellationToken)
    {
        var alreadyExists = await _credentialsActivationRepository.HasIdentityDocumentAsync(citizen.Id, cancellationToken);

        if (alreadyExists)
        {
            _alreadyActivatedTypes.Add(CredentialType.IdentityDocument);
            return false;
        }

        var id = await _governmentRegistryGateway.GetIdentityDocumentBySaIdAsync(citizen.SaId, cancellationToken);
        if (id is null)
        {
            _unavailableTypes.Add(CredentialType.IdentityDocument);
            return false;
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
            CitizenId = citizen.Id,

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
            _alreadyActivatedTypes.Add(CredentialType.DriversLicense);
            return false;
        }

        var dL = await _governmentRegistryGateway.GetDriversLicenseBySaIdAsync(citizen.SaId, cancellationToken);
        if (dL is null)
        {
            _unavailableTypes.Add(CredentialType.DriversLicense);
            return false;
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
            CitizenId = citizen.Id,

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

    private string BuildResponseMessage()
    {
        var unavailable = string.Join(", ", _unavailableTypes.Select(t => t switch { CredentialType.IdentityDocument => "Identity Document", CredentialType.DriversLicense => "Driver's License", _ => t.ToString() }));
        var alreadyActivated = string.Join(", ", _alreadyActivatedTypes.Select(t => t switch { CredentialType.IdentityDocument => "Identity Document", CredentialType.DriversLicense => "Driver's License", _ => t.ToString() }));
        var activated = string.Join(", ", _activatedTypes.Select(t => t switch { CredentialType.IdentityDocument => "Identity Document", CredentialType.DriversLicense => "Driver's License", _ => t.ToString() }));

        var messages = new List<string>();

        if (_activatedTypes.Count > 0)
            messages.Add($"The following credentials were activated successfully: {activated}");

        if (_alreadyActivatedTypes.Count > 0)
            messages.Add($"The following credentials were already activated: {alreadyActivated}");

        if (_unavailableTypes.Count > 0)
            messages.Add($"The following credentials were unavailable: {unavailable}");

        return string.Join(Environment.NewLine, messages);
    }
}