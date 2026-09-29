using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.BackgroundJobs;

public class CredentialUpdateBackgroundService : DailyScheduledBackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<CredentialUpdateBackgroundService> _logger;

    public CredentialUpdateBackgroundService(IServiceScopeFactory scopeFactory, ILogger<CredentialUpdateBackgroundService> logger) : base(logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override string JobDisplayName => "CredentialUpdate";

    protected override async Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<ICredentialUpdateService>();

        return await service.HasCompletedTodayAsync(cancellationToken);
    }

    protected override async Task RunOnceAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<ICredentialUpdateService>();

        try
        {
            var result = await service.RunUpdateCheckAsync(cancellationToken);
            _logger.LogInformation("{Job}: run finished with status {Status}, processed {Count} citizens.", JobDisplayName, result.Status, result.ProcessedCount);
        }
        catch (CredentialUpdateJobAlreadyRunningException)
        {
            _logger.LogInformation("{Job}: another run already in progress for today, skipping.", JobDisplayName);
        }
    }
}
