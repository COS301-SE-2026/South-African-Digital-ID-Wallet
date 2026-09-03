using Domain.Entities;
using Application.Features.Credentials.DTOs;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class CredentialUpdateMapper
{
    [MapProperty(nameof(JobRun.CreatedAt), nameof(CredentialUpdateCheckResponseDto.StartedAt))]
    [MapperIgnoreSource(nameof(JobRun.JobName))]
    [MapperIgnoreSource(nameof(JobRun.Id))]
    [MapperIgnoreSource(nameof(JobRun.UpdatedAt))]
    public partial CredentialUpdateCheckResponseDto JobRunToResponseDto(JobRun jobRun);
}