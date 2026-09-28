namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IEmergencyNotifier
{
    Task NotifyEmergencyAccessAsync(Guid accessId, CancellationToken ct);
}