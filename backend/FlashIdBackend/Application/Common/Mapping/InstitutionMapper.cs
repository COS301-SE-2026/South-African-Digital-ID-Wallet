using Application.Features.Institutions.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class InstitutionMapper
{
    [MapProperty(
        nameof(Institution.Id),
        nameof(GetInstitutionResponseDto.InstitutionId)
    )]
    [MapperIgnoreSource(nameof(Institution.ApiKeyReference))]
    [MapperIgnoreSource(nameof(Institution.RegisteredBy))]
    [MapperIgnoreSource(nameof(Institution.Officials))]
    [MapperIgnoreSource(nameof(Institution.UpdatedAt))]
    public partial GetInstitutionResponseDto InstitutionToGetResponseDto(Institution institution);

    [MapProperty(
        nameof(Institution.Id),
        nameof(RegisterInstitutionResponseDto.InstitutionId)
    )]
    [MapperIgnoreTarget(nameof(RegisterInstitutionResponseDto.ApiKey))]
    [MapperIgnoreSource(nameof(Institution.RegisteredById))]
    [MapperIgnoreSource(nameof(Institution.RegisteredBy))]
    [MapperIgnoreSource(nameof(Institution.Officials))]
    [MapperIgnoreSource(nameof(Institution.UpdatedAt))]
    public partial RegisterInstitutionResponseDto InstitutionToRegisterResponseDto(Institution institution);
}
