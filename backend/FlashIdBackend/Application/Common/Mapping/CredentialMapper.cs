using Application.Features.Credentials.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class CredentialMapper
{
    [MapperIgnoreTarget(nameof(CredentialResponseDto.Type))]
    [MapperIgnoreTarget(nameof(CredentialResponseDto.Title))]
    [MapperIgnoreTarget(nameof(CredentialResponseDto.Citizen))]
    [MapperIgnoreTarget(nameof(CredentialResponseDto.Activity))]
    public partial CredentialResponseDto CredentialToResponseDto(Credential credential);
}