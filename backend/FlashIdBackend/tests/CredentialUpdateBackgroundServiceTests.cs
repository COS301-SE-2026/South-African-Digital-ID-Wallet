using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Credentials.DTOs;
using Application.Features.Credentials.Exceptions;
using Domain.Enums;
using Infrastructure.BackgroundJobs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace tests;

public class CredentialUpdateBackgroundServiceTests
{
    private sealed class FakeCredentialUpdateService : ICredentialUpdateService
    {
        private readonly TaskCompletionSource _runSignal = new();

        public bool HasCompletedToday;
        public int RunCount;

        public Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken) => Task.FromResult(HasCompletedToday);

        public Task<CredentialUpdateCheckResponseDto> RunUpdateCheckAsync(CancellationToken cancellationToken)
        {
            RunCount++;
            _runSignal.TrySetResult();

            return Task.FromResult(new CredentialUpdateCheckResponseDto
            {
                RunDate = DateTime.UtcNow.Date,
                Status = JobRunStatus.Completed,
                ProcessedCount = 0,
                StartedAt = DateTime.UtcNow,
            });
        }

        public Task WaitForRunAsync(TimeSpan timeout) => _runSignal.Task.WaitAsync(timeout);
    }

    private sealed class ThrowingCredentialUpdateService : ICredentialUpdateService
    {
        public int CallCount;
        public Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<CredentialUpdateCheckResponseDto> RunUpdateCheckAsync(CancellationToken cancellationToken)
        {
            CallCount++;
            throw new CredentialUpdateJobAlreadyRunningException();
        }
    }

    private static (CredentialUpdateBackgroundService Service, FakeCredentialUpdateService Fake) BuildService(bool hasCompletedToday)
    {
        var fake = new FakeCredentialUpdateService { HasCompletedToday = hasCompletedToday };
        var services = new ServiceCollection();

        services.AddSingleton<ICredentialUpdateService>(fake);

        var provider = services.BuildServiceProvider();
        var service = new CredentialUpdateBackgroundService(provider.GetRequiredService<IServiceScopeFactory>(), NullLogger<CredentialUpdateBackgroundService>.Instance);

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
        var fake = new ThrowingCredentialUpdateService();
        var services = new ServiceCollection();

        services.AddSingleton<ICredentialUpdateService>(fake);

        var provider = services.BuildServiceProvider();
        var service = new CredentialUpdateBackgroundService(provider.GetRequiredService<IServiceScopeFactory>(), NullLogger<CredentialUpdateBackgroundService>.Instance);

        await service.StartAsync(TestContext.Current.CancellationToken);
        await Task.Delay(300, TestContext.Current.CancellationToken);
        await service.StopAsync(TestContext.Current.CancellationToken);

        Assert.True(fake.CallCount > 0);
    }
}
