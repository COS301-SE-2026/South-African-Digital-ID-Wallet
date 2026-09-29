using Application.Features.Notifications.DTOs;
using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface INotificationRepository
{
    Task<Citizen?> GetCitizenByUserIdAsync(Guid userId);

    Task<List<NotificationDto>> GetNotificationsByCitizenIdAsync(Guid citizenId);
    Task CreateNotificationAsync(Notification notification);

}