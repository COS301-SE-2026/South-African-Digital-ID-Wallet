using Application.Features.Credentials.Dtos;
using Domain.Entities;
using Domain.Enums;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class IdentityDocumentMapper
{
    private string MapCitizenStatus(CitizenStatus citizenStatus) => citizenStatus.ToString();
    public partial IdentityDocumentResponseDto ToResponse(IdentityDocument identityDocument);
}