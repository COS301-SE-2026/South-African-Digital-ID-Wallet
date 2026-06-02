using Application.Features.Citizens.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class CitizenMapper
{
    // Citizen.Id -> CitizenId (names differ, so we need MapProperty).
    // Citizen.User.Username -> Username (Mapperly follows navigation properties
    // when you specify the path as a string array).
    [MapProperty(nameof(Citizen.Id), nameof(RegisterCitizenResponseDto.CitizenId))]
    [MapProperty([nameof(Citizen.User), nameof(User.Username)],
        nameof(RegisterCitizenResponseDto.Username))]
    public partial RegisterCitizenResponseDto CitizenToRegisterResponseDto(Citizen citizen);
}