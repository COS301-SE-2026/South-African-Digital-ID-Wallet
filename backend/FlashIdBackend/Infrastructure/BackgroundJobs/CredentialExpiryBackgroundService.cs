using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.BackgroundJobs;

public class CredentialExpiryBackgroundService : DailyScheduledBackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<CredentialExpiryBackgroundService> _logger;

    public CredentialExpiryBackgroundService(IServiceScopeFactory scopeFactory, ILogger<CredentialExpiryBackgroundService> logger) : base(logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override string JobDisplayName => "CredentialExpiry";

    protected override async Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<ICredentialExpiryService>();

        return await service.HasCompletedTodayAsync(cancellationToken);
    }

    protected override async Task RunOnceAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<ICredentialExpiryService>();

        try
        {
            var result = await service.RunExpiryCheckAsync(cancellationToken);
            _logger.LogInformation("{Job}: run finished with status {Status}, processed {Count} credentials.", JobDisplayName, result.Status, result.ProcessedCount);
        }
        catch (CredentialExpiryJobAlreadyRunningException)
        {
            _logger.LogInformation("{Job}: another run already in progress for today, skipping.", JobDisplayName);
        }
    }
}
