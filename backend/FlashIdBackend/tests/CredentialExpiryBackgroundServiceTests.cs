using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Domain.Enums;
using Infrastructure.BackgroundJobs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace tests;

public class CredentialExpiryBackgroundServiceTests
{
    private sealed class FakeCredentialExpiryService : ICredentialExpiryService
    {
        private readonly TaskCompletionSource _runSignal = new();

        public bool HasCompletedToday;
        public int RunCount;

        public Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken) => Task.FromResult(HasCompletedToday);

        public Task<CredentialExpiryCheckResponseDto> RunExpiryCheckAsync(CancellationToken cancellationToken)
        {
            RunCount++;
            _runSignal.TrySetResult();

            return Task.FromResult(new CredentialExpiryCheckResponseDto
            {
                RunDate = DateTime.UtcNow.Date,
                Status = JobRunStatus.Completed,
                ProcessedCount = 0,
                StartedAt = DateTime.UtcNow,
            });
        }

        public Task WaitForRunAsync(TimeSpan timeout) => _runSignal.Task.WaitAsync(timeout);
    }

    private sealed class ThrowingCredentialExpiryService : ICredentialExpiryService
    {
        public Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<CredentialExpiryCheckResponseDto> RunExpiryCheckAsync(CancellationToken cancellationToken) => throw new CredentialExpiryJobAlreadyRunningException();
    }

    private static (CredentialExpiryBackgroundService Service, FakeCredentialExpiryService Fake) BuildService(bool hasCompletedToday)
    {
        var fake = new FakeCredentialExpiryService { HasCompletedToday = hasCompletedToday };
        var services = new ServiceCollection();

        services.AddSingleton<ICredentialExpiryService>(fake);

        var provider = services.BuildServiceProvider();
        var service = new CredentialExpiryBackgroundService(provider.GetRequiredService<IServiceScopeFactory>(), NullLogger<CredentialExpiryBackgroundService>.Instance);

        return (service, fake);
    }

    [Fact]
    public async Task ExecuteAsync_NoCompletedRunToday_RunsImmediatelyOnStartup()
    {
        var (service, fake) = BuildService(hasCompletedToday: false);

        await service.StartAsync(TestContext.Current.CancellationToken);
        await fake.WaitForRunAsync(TimeSpan.FromSeconds(5));
        await service.StopAsync(TestContext.Current.CancellationToken);

        Assert.Equal(1, fake.RunCount);
    }

    [Fact]
    public async Task ExecuteAsync_AlreadyCompletedToday_DoesNotRunBeforeNextMidnight()
    {
        var (service, fake) = BuildService(hasCompletedToday: true);

        await service.StartAsync(TestContext.Current.CancellationToken);
        await Task.Delay(300, TestContext.Current.CancellationToken);
        await service.StopAsync(TestContext.Current.CancellationToken);

        Assert.Equal(0, fake.RunCount);
    }

    [Fact]
    public async Task ExecuteAsync_InnerServiceThrowsAlreadyRunning_DoesNotCrashBackgroundService()
    {
        var fake = new ThrowingCredentialExpiryService();
        var services = new ServiceCollection();

        services.AddSingleton<ICredentialExpiryService>(fake);

        var provider = services.BuildServiceProvider();
        var service = new CredentialExpiryBackgroundService(provider.GetRequiredService<IServiceScopeFactory>(), NullLogger<CredentialExpiryBackgroundService>.Instance);

        await service.StartAsync(TestContext.Current.CancellationToken);
        await Task.Delay(300, TestContext.Current.CancellationToken);
        await service.StopAsync(TestContext.Current.CancellationToken);
    }
}
