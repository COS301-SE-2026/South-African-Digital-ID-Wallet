using Domain.Entities;
using Application.Features.Credentials.DTOs;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class CredentialExpiryMapper
{
    public partial CredentialExpiryCheckResponseDto JobRunToResponseDto(JobRun jobRun);
}