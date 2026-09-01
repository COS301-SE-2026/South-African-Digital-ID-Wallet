using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class CredentialService : ICredentialService
{
    private readonly ICredentialRepository _credentialRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IInstitutionRepository _institutionRepository;
    private readonly CredentialMapper _mapper;

    public CredentialService(ICredentialRepository credentialRepository, INotificationRepository notificationRepository, IInstitutionRepository institutionRepository, CredentialMapper mapper)
    {
        _credentialRepository = credentialRepository;
        _notificationRepository = notificationRepository;
        _institutionRepository = institutionRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CredentialResponseDto>> GetMyCredentialsAsync(Guid userId)
    {
        var citizen = await _credentialRepository.GetCitizenByUserIdAsync(userId);
        if (citizen == null)
        {
            return Enumerable.Empty<CredentialResponseDto>();
        }
        var credentials = await _credentialRepository.GetCredentialsByCitizenIdAsync(citizen.Id);
        return credentials.Select(c => MapToDto(c, citizen));
    }
    public async Task<SearchCitizensResponseDto> SearchCitizensAsync(string? query, int page, int pageSize)
    {
        var (citizens, totalCount) = await _credentialRepository.SearchCitizensAsync(query, page, pageSize);

        var results = citizens.Select(citizen => new CitizenSearchResultDto
        {
            CitizenId = citizen.Id,
            FirstName = citizen.Names,
            Surname = citizen.Surname,
            IdNumber = citizen.SaId,
            DateJoined = citizen.ActivatedAt,
            ExpiresOn = citizen.Credentials
                .Select(c => c.DriversLicense)
                .FirstOrDefault(dl => dl != null)?.ExpiryDate,
        }).ToList();

        return new SearchCitizensResponseDto
        {
            Results = results,
            TotalResults = totalCount,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<IEnumerable<CredentialResponseDto>> GetCredentialsForCitizenAsync(Guid citizenId)
    {
        var citizen = await _credentialRepository.GetCitizenByCitizenIdAsync(citizenId);
        if (citizen == null)
            throw new CitizenNotFoundException(citizenId);

        var credentials = await _credentialRepository.GetCredentialsByCitizenIdAsync(citizen.Id);
        return credentials.Select(c => MapToDto(c, citizen));
    }

    public async Task<RevokeCredentialResponseDto> RevokeCredentialAsync(Guid credentialId, Guid adminUserId, RevokeCredentialRequestDto request, string ipAddress)
    {
        var credential = await _credentialRepository.GetByIdAsync(credentialId);
        if (credential == null)
            throw new CredentialNotFoundException(credentialId);

        if (request.NewStatus != CredentialStatus.Revoked && request.NewStatus != CredentialStatus.Investigation)
            throw new InvalidCredentialStatusTransitionException($"Credentials can only be marked as {CredentialStatus.Revoked} or {CredentialStatus.Investigation} through this endpoint.");

        if (credential.Status == request.NewStatus)
            throw new InvalidCredentialStatusTransitionException($"Credential is already {request.NewStatus}.");

        credential.Status = request.NewStatus;
        await _credentialRepository.SaveChangesAsync();

        await _institutionRepository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = adminUserId,
            EventType = AuditEventType.CredentialRevoked,
            Details = $"Credential {credential.Id} marked as {request.NewStatus}. Reason: {request.Reason}",
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow,
            CitizenId = credential.CitizenId,
        });
        await _institutionRepository.SaveChangesAsync();

        await _notificationRepository.CreateNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            CitizenId = credential.CitizenId,
            Title = "Credential status updated",
            Description = request.NewStatus == CredentialStatus.Revoked
                ? "One of your credentials has been revoked. Contact support if you believe this is an error."
                : "One of your credentials is under investigation and may be temporarily unavailable.",
            Tone = "warning",
            CreatedAt = DateTime.UtcNow,
        });

        return new RevokeCredentialResponseDto
        {
            CredentialId = credential.Id,
            Status = credential.Status,
            UpdatedAt = DateTime.UtcNow,
        };
    }
    public async Task<ReinstateCredentialResponseDto> ReinstateCredentialAsync(Guid credentialId, Guid adminUserId, ReinstateCredentialRequestDto request, string ipAddress)
    {
        var credential = await _credentialRepository.GetByIdAsync(credentialId);
        if (credential == null)
            throw new CredentialNotFoundException(credentialId);

        if (credential.Status != CredentialStatus.Revoked && credential.Status != CredentialStatus.Investigation)
            throw new InvalidCredentialStatusTransitionException($"Only credentials that are {CredentialStatus.Revoked} or {CredentialStatus.Investigation} can be reinstated.");

        credential.Status = CredentialStatus.Active;
        await _credentialRepository.SaveChangesAsync();

        await _institutionRepository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorId = adminUserId,
            EventType = AuditEventType.CredentialReinstated,
            Details = $"Credential {credential.Id} reinstated to Active. Reason: {request.Reason}",
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow,
        });
        await _institutionRepository.SaveChangesAsync();

        await _notificationRepository.CreateNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            CitizenId = credential.CitizenId,
            Title = "Credential status updated",
            Description = "One of your credentials has been reinstated and is now active again.",
            Tone = "success",
            CreatedAt = DateTime.UtcNow,
        });

        return new ReinstateCredentialResponseDto
        {
            CredentialId = credential.Id,
            Status = credential.Status,
            UpdatedAt = DateTime.UtcNow,
        };
    }
    private CredentialResponseDto MapToDto(Credential credential, Citizen citizen)
    {
        var dto = _mapper.CredentialToResponseDto(credential);

        if (dto.IdentityDocument != null)
        {
            dto.IdentityDocument.IdNumber = citizen.SaId;
        }

        if (credential.DriversLicense != null)
        {
            dto.Type = "DriversLicense";
            dto.Title = "Driver's Licence";
        }
        else
        {
            dto.Type = "IdentityDocument";
            dto.Title = "National ID Card";
        }

        return dto;
    }
}