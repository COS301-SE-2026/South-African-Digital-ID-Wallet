using Application.Features.Notifications.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class NotificationMapper
{
    public partial NotificationDto NotificationToDto(Notification notification);
}