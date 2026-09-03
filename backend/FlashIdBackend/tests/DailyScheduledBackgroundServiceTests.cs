using Infrastructure.BackgroundJobs;
using Microsoft.Extensions.Logging.Abstractions;

namespace tests;

public class DailyScheduledBackgroundServiceTests
{
    private sealed class FakeScheduledService : DailyScheduledBackgroundService
    {
        private readonly TaskCompletionSource _runSignal = new();

        public bool HasCompletedToday;
        public int RunCount;

        public FakeScheduledService() : base(NullLogger.Instance) { }

        protected override string JobDisplayName => "FakeJob";

        protected override Task<bool> HasCompletedTodayAsync(CancellationToken cancellationToken) => Task.FromResult(HasCompletedToday);

        protected override Task RunOnceAsync(CancellationToken cancellationToken)
        {
            RunCount++;
            _runSignal.TrySetResult();

            return Task.CompletedTask;
        }

        public Task WaitForRunAsync(TimeSpan timeout) => _runSignal.Task.WaitAsync(timeout);
    }

    [Fact]
    public async Task ExecuteAsync_NoCompletedRunToday_RunsImmediatelyOnStartup()
    {
        var service = new FakeScheduledService { HasCompletedToday = false };

        await service.StartAsync(TestContext.Current.CancellationToken);
        await service.WaitForRunAsync(TimeSpan.FromSeconds(5));
        await service.StopAsync(TestContext.Current.CancellationToken);

        Assert.Equal(1, service.RunCount);
    }

    [Fact]
    public async Task ExecuteAsync_AlreadyCompletedToday_DoesNotRunBeforeNextMidnight()
    {
        var service = new FakeScheduledService { HasCompletedToday = true };

        await service.StartAsync(TestContext.Current.CancellationToken);
        await Task.Delay(300, TestContext.Current.CancellationToken);
        await service.StopAsync(TestContext.Current.CancellationToken);

        Assert.Equal(0, service.RunCount);
    }
}
