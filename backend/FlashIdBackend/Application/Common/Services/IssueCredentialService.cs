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
        if (!request.ConsentGiven)
        {
            throw new CitizenConsentRequiredException();
        }

        ValidateSaId(request.SaId);

        var citizen = await _repo.GetCitizenBySaIdAsync(request.SaId, cancellationToken) ?? throw new CitizenNotFoundException(request.SaId);

        if (citizen.Status != CitizenStatus.Activated) throw new CitizenNotOnboardedException(request.SaId);

        Credential credential = request.CredentialType switch
        {
            // CredentialType.DriversLicense => await BuildDriversLicenseCredential(citizen, cancellationToken),
            // CredentialType.IdentityDocument => await BuildIdentityDocumentCredential(citizen, cancellationToken),
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