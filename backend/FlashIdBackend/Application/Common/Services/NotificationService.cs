using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Notifications.DTOs;

namespace Application.Common.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;

    public NotificationService(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<NotificationDto>> GetMyNotificationsAsync(Guid userId)
    {
        var citizen = await _repository.GetCitizenByUserIdAsync(userId);

        if (citizen == null)
            return new List<NotificationDto>();

        return await _repository.GetNotificationsByCitizenIdAsync(citizen.Id);
    }
}