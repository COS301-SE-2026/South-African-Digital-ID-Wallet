using Application.Features.Auth.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class AuthMapper
{
    [MapProperty(nameof(User.Id), nameof(UserProfileDto.UserId))]
    [MapperIgnoreTarget(nameof(UserProfileDto.Names))]
    [MapperIgnoreTarget(nameof(UserProfileDto.Surname))]
    public partial UserProfileDto UserToUserProfileDto(User user);
}