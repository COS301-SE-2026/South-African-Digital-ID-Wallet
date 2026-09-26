using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.BackgroundJobs;

public class KeyRotationBackgroundService : DailyScheduledBackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<KeyRotationBackgroundService> _logger;

    public KeyRotationBackgroundService(IServiceScopeFactory scopeFactory, ILogger<KeyRotationBackgroundService> logger) : base(logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override string JobDisplayName => "QrKeyRotation";

    protected override async Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();

        try
        {
            var service = scope.ServiceProvider.GetRequiredService<IKeyRotationService>();
            return await service.HasCompletedTodayAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "{Job}: unable to check today's run status, treating as skipped for today.", JobDisplayName);
            return true;
        }
    }

    protected override async Task RunOnceAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();

        try
        {
            var service = scope.ServiceProvider.GetRequiredService<IKeyRotationService>();
            await service.RotateQrSigningKeyAsync(cancellationToken);
            _logger.LogInformation("{Job}: run finished.", JobDisplayName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "{Job}: run failed, will retry at next scheduled check.", JobDisplayName);
        }
    }
}