using Application.Features.Institutions.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Mappers;

[Mapper]
public partial class InstitutionMapper
{
    public RegisterInstitutionResponseDto ToRegisterDto(Institution institution, string apiKey, Guid apiKeyReference) => new()
    {
        InstitutionId = institution.Id,
        Name = institution.Name,
        Type = institution.Type.ToString(),
        ApiKey = apiKey,
        ApiKeyReference = apiKeyReference,
        VerificationNumber = institution.VerificationNumber,
        CreatedAt = institution.CreatedAt,
    };
}