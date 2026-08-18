using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.BackgroundServices;

public class ApiKeyRotationService : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(24);
    private static readonly TimeSpan RotationAge = TimeSpan.FromDays(30);

    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ApiKeyRotationService> _logger;

    public ApiKeyRotationService(IServiceProvider serviceProvider, ILogger<ApiKeyRotationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RotateOverdueKeysAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "API key rotation pass failed.");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task RotateOverdueKeysAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var institutionRepository = scope.ServiceProvider.GetRequiredService<IInstitutionRepository>();
        var institutionService = scope.ServiceProvider.GetRequiredService<IInstitutionService>();

        var threshold = DateTime.UtcNow - RotationAge;
        var overdueInstitutions = await institutionRepository.GetInstitutionsWithApiKeyOlderThanAsync(threshold);

        if (overdueInstitutions.Count == 0)
        {
            _logger.LogInformation("API key rotation check: no institutions overdue for rotation.");
            return;
        }

        _logger.LogInformation("API key rotation check: {Count} institution(s) overdue for rotation.", overdueInstitutions.Count);

        foreach (var institution in overdueInstitutions)
        {
            cancellationToken.ThrowIfCancellationRequested();

            try
            {
                await institutionService.RegenerateApiKeyAsync(institution.Id, adminId: null);
                _logger.LogInformation("Automatically regenerated API key for institution '{InstitutionName}' ({InstitutionId}).", institution.Name, institution.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to automatically regenerate API key for institution '{InstitutionName}' ({InstitutionId}).", institution.Name, institution.Id);
            }
        }
    }
}