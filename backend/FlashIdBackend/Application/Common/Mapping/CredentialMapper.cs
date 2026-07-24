using Application.Features.Credentials.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class CredentialMapper
{
    [MapperIgnoreTarget(nameof(CredentialResponseDto.Type))]
    [MapperIgnoreTarget(nameof(CredentialResponseDto.Title))]
    public partial CredentialResponseDto CredentialToResponseDto(Credential credential);
}