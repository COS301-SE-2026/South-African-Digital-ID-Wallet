using Application.Features.Notifications.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface INotificationService
{
    Task<List<NotificationDto>> GetMyNotificationsAsync(Guid userId);
}