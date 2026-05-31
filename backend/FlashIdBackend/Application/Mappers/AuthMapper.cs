using Application.Features.Auth.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Mappers;

[Mapper]
public partial class AuthMapper
{
    public partial LoginResponseDto ToDto(User user);
}
