using Application.Features.Citizens.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class CitizenMapper
{
    [MapProperty(nameof(User.Id), nameof(RegisterCitizenResponseDto.UserId))]
    [MapProperty(nameof(User.Email), nameof(RegisterCitizenResponseDto.Email))]
    [MapProperty(nameof(User.CreatedAt), nameof(RegisterCitizenResponseDto.CreatedAt))]
    public partial RegisterCitizenResponseDto CitizenToRegisterResponseDto(User user);
}