using System.Text.RegularExpressions;
using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.Citizens.Exceptions;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Enums;
using Application.Features.Credentials.Exceptions;
using Application.Features.Onboarding.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class IssueCredentialService : IIssueCredentialService
{
    private readonly ICredentialsActivationRepository _repo;
    private readonly IGovernmentRegistryGateway _govRegGateway;
    private readonly CredentialMapper _credMapper;
    private readonly CitizenMapper _citMapper;

    public IssueCredentialService(ICredentialsActivationRepository repo, IGovernmentRegistryGateway govRegGateway, CredentialMapper credMapper, CitizenMapper citMapper)
    {
        _repo = repo;
        _govRegGateway = govRegGateway;
        _credMapper = credMapper;
        _citMapper = citMapper;
    }

    private static void ValidateSaId(string saId)
    {
        if (string.IsNullOrWhiteSpace(saId) || !Regex.IsMatch(saId.Trim(), @"^\d{13}$", RegexOptions.None, TimeSpan.FromMilliseconds(600)))
        {
            throw new ArgumentException("A valid 13-digit South African ID number is required.");
        }
    }

    private async Task<Credential> BuildDriversLicenseCredential(Citizen citizen, Guid officialId, string ipAddress, CancellationToken cancellationToken)
    {
        if (await _repo.HasDriversLicenseAsync(citizen.Id, cancellationToken))
        {
            await LogIssueFailureAsync(citizen.SaId, "DriversLicense already active", officialId, ipAddress, cancellationToken);
            throw new CredentialAlreadyIssuedException(citizen.SaId, CredentialType.DriversLicense);
        }

        var dL = await _govRegGateway.GetDriversLicenseBySaIdAsync(citizen.SaId, cancellationToken) ?? throw new GovernmentRegistryRecordNotFoundException(citizen.SaId, CredentialType.DriversLicense);

        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Citizen = citizen,
            Status = CredentialStatus.Active,
            Signature = dL.Signature,
            IssuedBy = dL.IssuedBy,
            IssueDate = dL.IssueDate.ToDateTime(TimeOnly.MinValue),
        };

        credential.DriversLicense = new DriversLicense
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

        return credential;
    }

    private async Task<Credential> BuildIdentityDocumentCredential(Citizen citizen, Guid officialId, string ipAddress, CancellationToken cancellationToken)
    {
        if (await _repo.HasIdentityDocumentAsync(citizen.Id, cancellationToken))
        {
            await LogIssueFailureAsync(citizen.SaId, "IdentityDocument already active", officialId, ipAddress, cancellationToken);
            throw new CredentialAlreadyIssuedException(citizen.SaId, CredentialType.IdentityDocument);
        }

        var iD = await _govRegGateway.GetIdentityDocumentBySaIdAsync(citizen.SaId, cancellationToken) ?? throw new GovernmentRegistryRecordNotFoundException(citizen.SaId, CredentialType.IdentityDocument);

        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Citizen = citizen,
            Status = CredentialStatus.Active,
            Signature = iD.Signature,
            IssuedBy = iD.IssuedBy,
            IssueDate = iD.IssueDate.ToDateTime(TimeOnly.MinValue),
        };

        credential.IdentityDocument = new IdentityDocument
        {
            Id = Guid.NewGuid(),
            CredentialId = credential.Id,
            Credential = credential,
            Citizenship = iD.CountryOfBirth,
            CountryOfBirth = iD.CountryOfBirth,
            Status = Enum.Parse<IdentityDocumentStatus>(iD.CitizenshipStatus),
            Nationality = iD.Nationality,
            PhotoPath = iD.PhotoBlob,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        return credential;
    }

    private async Task LogIssueFailureAsync(string saId, string reason, Guid officialId, string ipAddress, CancellationToken cancellationToken)
    {
        await _repo.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.CredentialIssueFailed,
            Details = $"Credential issuance for citizen {saId} declined: {reason}.",
            ActorId = officialId,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow,
        }, cancellationToken);

        await _repo.SaveChangesAsync(cancellationToken);
    }

    public async Task<CitizenCredentialStatusResponseDto> GetCitizenStatusAsync(string saId, CancellationToken cancellationToken)
    {
        ValidateSaId(saId);

        var citizen = await _repo.GetCitizenBySaIdAsync(saId, cancellationToken) ?? throw new CitizenNotFoundException(saId);
        var response = _citMapper.CitizenToStatusResponseDto(citizen);

        if (citizen.Status == CitizenStatus.Activated && citizen.User is not null)
        {
            response.PhoneNumber = citizen.User.PhoneNumber;
            response.Email = citizen.User.Email;
        }

        response.ExistingCredentials = citizen.Credentials.Select(c => new ExistingCredentialSummaryDto
        {
            Type = c.DriversLicense is not null ? "DriversLicense" : "IdentityDocument",
            Status = c.Status.ToString(),
            IssueDate = c.IssueDate,
        }).ToList();

        return response;
    }

    public async Task<CredentialResponseDto> IssueCredentialAsync(IssueCredentialRequestDto request, Guid officialId, string ipAddress, CancellationToken cancellationToken)
    {
        ValidateSaId(request.SaId);

        if (!request.ConsentGiven)
        {
            await LogIssueFailureAsync(request.SaId, "consent not given", officialId, ipAddress, cancellationToken);
            throw new CitizenConsentRequiredException();
        }

        var citizen = await _repo.GetCitizenBySaIdAsync(request.SaId, cancellationToken) ?? throw new CitizenNotFoundException(request.SaId);

        if (citizen.Status != CitizenStatus.Activated) throw new CitizenNotOnboardedException(request.SaId);

        Credential credential = request.CredentialType switch
        {
            CredentialType.DriversLicense => await BuildDriversLicenseCredential(citizen, officialId, ipAddress, cancellationToken),
            CredentialType.IdentityDocument => await BuildIdentityDocumentCredential(citizen, officialId, ipAddress, cancellationToken),
            _ => throw new ArgumentOutOfRangeException(nameof(request.CredentialType), request.CredentialType, "The selected credential type is not supported."),
        };

        await _repo.AddCredentialAsync(credential, cancellationToken);

        var now = DateTime.UtcNow;

        await _repo.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.ConsentRecorded,
            Details = $"POPIA Section 11 consent recorded for {request.CredentialType} issuance to citizen {citizen.SaId}.",
            ActorId = officialId,
            IpAddress = ipAddress,
            CreatedAt = now,
        }, cancellationToken);

        await _repo.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.CredentialIssued,
            Details = $"{request.CredentialType} credential issued to citizen {citizen.SaId} by official {officialId}.",
            ActorId = officialId,
            IpAddress = ipAddress,
            CreatedAt = now,
        }, cancellationToken);

        await _repo.AddNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Title = "New credential added",
            Description = $"A {request.CredentialType} has been added to your FlashID wallet.",
            Tone = "Success",
            CreatedAt = now,
        }, cancellationToken);

        await _repo.SaveChangesAsync(cancellationToken);

        var response = _credMapper.CredentialToResponseDto(credential);

        if (credential.DriversLicense != null)
        {
            response.Type = "DriversLicense";
            response.Title = "Driver's Licence";
        }
        else
        {
            response.Type = "IdentityDocument";
            response.Title = "National ID Card";
            response.IdentityDocument!.IdNumber = citizen.SaId;
        }

        return response;
    }
}