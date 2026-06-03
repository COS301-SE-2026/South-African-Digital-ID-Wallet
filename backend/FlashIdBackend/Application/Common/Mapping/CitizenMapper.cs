using Application.Features.Citizens.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class CitizenMapper
{
    [MapProperty(nameof(Citizen.Id), nameof(RegisterCitizenResponseDto.CitizenId))]
    [MapProperty(nameof(Citizen.UserId), nameof(RegisterCitizenResponseDto.UserId))]
    [MapProperty([nameof(Citizen.User), nameof(User.Username)],
        nameof(RegisterCitizenResponseDto.Username))]
    public partial RegisterCitizenResponseDto CitizenToRegisterResponseDto(Citizen citizen);
}