using Application.Features.ActivityOverview.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class ActivityOverviewMapper
{
    [MapperIgnoreSource(nameof(AuditLog.Actor))]
    [MapperIgnoreSource(nameof(AuditLog.ActorId))]
    [MapperIgnoreSource(nameof(AuditLog.IpAddress))]
    [MapProperty(nameof(AuditLog.Details), nameof(ActivityOverviewDto.Title))]
    [MapProperty(nameof(AuditLog.CreatedAt), nameof(ActivityOverviewDto.Timestamp))]
    [MapProperty(nameof(AuditLog.EventType), nameof(ActivityOverviewDto.Type))]
    public partial ActivityOverviewDto AuditLogToResponseDto(AuditLog auditLog);
}