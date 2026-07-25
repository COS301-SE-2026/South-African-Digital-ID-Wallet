using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.Credentials.DTOs;
using Domain.Entities;

namespace Application.Common.Services;

public class CredentialService : ICredentialService
{
    private readonly ICredentialRepository _credentialRepository;
    private readonly CredentialMapper _mapper;

    public CredentialService(ICredentialRepository credentialRepository, CredentialMapper mapper)
    {
        _credentialRepository = credentialRepository;
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