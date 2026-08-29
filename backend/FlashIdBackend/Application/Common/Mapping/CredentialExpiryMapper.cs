using Domain.Entities;
using Application.Features.Credentials.DTOs;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class CredentialExpiryMapper
{
    [MapProperty(nameof(JobRun.CreatedAt), nameof(CredentialExpiryCheckResponseDto.StartedAt))]
    [MapperIgnoreSource(nameof(JobRun.JobName))]
    [MapperIgnoreSource(nameof(JobRun.Id))]
    [MapperIgnoreSource(nameof(JobRun.UpdatedAt))]
    public partial CredentialExpiryCheckResponseDto JobRunToResponseDto(JobRun jobRun);
}