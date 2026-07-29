using Application.Features.Citizens.Dtos;
using Domain.Entities;
using Domain.Enums;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class CitizenMapper
{
    private string MapGender(Gender gender) => gender.ToString();

    public partial CitizenRecordResponseDto ToResponse(CitizenRecord citizenRecord);
}