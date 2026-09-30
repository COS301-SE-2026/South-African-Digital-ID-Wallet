using Application.Common.Interfaces.ServiceInterfaces;
using Infrastructure.BackgroundJobs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace tests;

public class EmergencyNotificationBackgroundServiceTests
{
    private static (EmergencyNotificationBackgroundService Worker, Mock<IEmergencyNotifier> Notifier) Build()
    {
        var notifier = new Mock<IEmergencyNotifier>();
        var services = new ServiceCollection();
        services.AddScoped(_ => notifier.Object);
        var provider = services.BuildServiceProvider();

        var worker = new EmergencyNotificationBackgroundService(
            new EmergencyNotificationQueue(),
            provider.GetRequiredService<IServiceScopeFactory>(),
            NullLogger<EmergencyNotificationBackgroundService>.Instance);

        return (worker, notifier);
    }

    [Fact]
    public async Task NotifyAsync_RunsTheNotifierInItsOwnScope()
    {
        var (worker, notifier) = Build();
        var accessId = Guid.NewGuid();

        await worker.NotifyAsync(accessId, TestContext.Current.CancellationToken);

        notifier.Verify(n => n.NotifyEmergencyAccessAsync(accessId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task NotifyAsync_NotifierFails_DoesNotStopTheWorker()
    {
        var (worker, notifier) = Build();
        notifier
            .Setup(n => n.NotifyEmergencyAccessAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("SMTP down"));

        await worker.NotifyAsync(Guid.NewGuid(), TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task ExecuteAsync_DeliversEveryQueuedAccess()
    {
        var notifier = new Mock<IEmergencyNotifier>();
        var delivered = new TaskCompletionSource();
        notifier
            .Setup(n => n.NotifyEmergencyAccessAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .Callback(() => delivered.TrySetResult())
            .Returns(Task.CompletedTask);

        var services = new ServiceCollection();
        services.AddScoped(_ => notifier.Object);
        var queue = new EmergencyNotificationQueue();
        using var worker = new EmergencyNotificationBackgroundService(
            queue,
            services.BuildServiceProvider().GetRequiredService<IServiceScopeFactory>(),
            NullLogger<EmergencyNotificationBackgroundService>.Instance);

        await worker.StartAsync(TestContext.Current.CancellationToken);
        var accessId = Guid.NewGuid();
        queue.Enqueue(accessId);

        await delivered.Task.WaitAsync(TimeSpan.FromSeconds(5), TestContext.Current.CancellationToken);
        await worker.StopAsync(TestContext.Current.CancellationToken);

        notifier.Verify(n => n.NotifyEmergencyAccessAsync(accessId, It.IsAny<CancellationToken>()), Times.Once);
    }
}
