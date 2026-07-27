using Application.Features.Auth.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class AuthMapper
{
    [MapProperty(nameof(User.Id), nameof(UserProfileDto.UserId))]
    [MapperIgnoreTarget(nameof(UserProfileDto.SaId))]
    [MapperIgnoreTarget(nameof(UserProfileDto.Names))]
    [MapperIgnoreTarget(nameof(UserProfileDto.Surname))]
    public partial UserProfileDto UserToUserProfileDto(User user);

    public UserProfileDto UserToUserProfileDto(User user, Citizen? citizen)
    {
        var dto = UserToUserProfileDto(user);

        if (citizen != null)
        {
            dto.SaId = citizen.SaId;
            dto.Names = citizen.Names;
            dto.Surname = citizen.Surname;
        }

        return dto;
    }
}