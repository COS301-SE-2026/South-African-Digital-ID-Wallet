using Application.Features.Institutions.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class InstitutionMapper
{
    // Institution.Id -> InstitutionId (names differ).
    // Institution.Type (enum InstitutionType) -> Type (string) is auto-handled.
    [MapProperty(
        nameof(Institution.Id),
        nameof(GetInstitutionResponseDto.InstitutionId)
    )]
    public partial GetInstitutionResponseDto InstitutionToGetResponseDto(Institution institution);

    // ApiKey is generated at runtime and is NOT on the Institution entity.
    // We tell Mapperly to skip it ([MapperIgnoreTarget]) and set it manually in the service.
    [MapProperty(
        nameof(Institution.Id),
        nameof(RegisterInstitutionResponseDto.InstitutionId)
    )]
    [MapperIgnoreTarget(nameof(RegisterInstitutionResponseDto.ApiKey))]
    public partial RegisterInstitutionResponseDto InstitutionToRegisterResponseDto(Institution institution);
}
