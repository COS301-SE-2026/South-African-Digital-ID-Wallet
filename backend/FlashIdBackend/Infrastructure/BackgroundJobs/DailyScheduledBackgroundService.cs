using Application.Common;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.BackgroundJobs;

public abstract class DailyScheduledBackgroundService : BackgroundService
{
    private readonly ILogger _logger;

    protected DailyScheduledBackgroundService(ILogger logger)
    {
        _logger = logger;
    }

    protected abstract string JobDisplayName { get; }

    protected abstract Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken);

    protected abstract Task RunOnceAsync(CancellationToken cancellationToken);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!await HasCompletedTodayAsync(stoppingToken))
        {
            _logger.LogInformation("{Job}: no completed run found for today on startup, running now.", JobDisplayName);
            await RunOnceAsync(stoppingToken);
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            var delay = SastClock.NextMidnightUtc(DateTime.UtcNow) - DateTime.UtcNow;
            if (delay > TimeSpan.Zero)
            {
                await Task.Delay(delay, stoppingToken);
            }

            if (stoppingToken.IsCancellationRequested)
            {
                break;
            }

            _logger.LogInformation("{Job} SAST midnight reached, runnning scheduled check.", JobDisplayName);
            await RunOnceAsync(stoppingToken);
        }
    }
}
