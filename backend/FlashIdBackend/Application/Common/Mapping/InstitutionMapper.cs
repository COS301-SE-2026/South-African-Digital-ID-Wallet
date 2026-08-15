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
    public partial GetInstitutionResponseDto InstitutionToGetResponseDto(Institution institution);

    [MapProperty(
        nameof(Institution.Id),
        nameof(RegisterInstitutionResponseDto.InstitutionId)
    )]
    public partial RegisterInstitutionResponseDto InstitutionToRegisterResponseDto(Institution institution);
}
