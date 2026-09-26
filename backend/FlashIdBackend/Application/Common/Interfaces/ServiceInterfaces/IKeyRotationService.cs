namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IKeyRotationService
{
    Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken);
    Task RotateQrSigningKeyAsync(CancellationToken cancellationToken);
}