namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IEmergencyNotificationQueue
{
    void Enqueue(Guid accessId);
}
