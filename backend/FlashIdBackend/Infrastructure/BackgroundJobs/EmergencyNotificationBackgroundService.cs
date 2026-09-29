using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.BackgroundJobs;

public sealed class EmergencyNotificationBackgroundService : BackgroundService
{
    private readonly EmergencyNotificationQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EmergencyNotificationBackgroundService> _logger;

    public EmergencyNotificationBackgroundService(
        EmergencyNotificationQueue queue,
        IServiceScopeFactory scopeFactory,
        ILogger<EmergencyNotificationBackgroundService> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var accessId in _queue.Reader.ReadAllAsync(stoppingToken))
        {
            await NotifyAsync(accessId, stoppingToken);
        }
    }

    public async Task NotifyAsync(Guid accessId, CancellationToken ct)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var notifier = scope.ServiceProvider.GetRequiredService<IEmergencyNotifier>();
            await notifier.NotifyEmergencyAccessAsync(accessId, ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Emergency access {AccessId}: notifying the citizen and contacts failed.", accessId);
        }
    }
}
