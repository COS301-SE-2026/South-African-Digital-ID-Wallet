using Application.Features.Citizens.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Mappers;

[Mapper]
public partial class CitizenMapper
{
    // written manually since registration response combines fields from 2 entities, meaning Mapperly will not generate this
    public RegisterCitizenResponseDto ToDto(Citizen citizen, User user) => new()
    {
        CitizenId = citizen.Id,
        UserId = user.Id,
        SaId = citizen.SaId,
        Username = user.Username,
        CreatedAt = citizen.CreatedAt,
    };
}