using Application.Features.Auth.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class AuthMapper
{
    [MapProperty(nameof(User.Id), nameof(UserProfileDto.UserId))]
    public partial UserProfileDto UserToUserProfileDto(User user);
}