using Application.Features.UpdatePassword.DTOs;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class UpdatePasswordMapper
{
    public partial UpdatePasswordDto ToDto(UpdatePasswordDto dto);
}