using System.Threading.Channels;
using Application.Common.Interfaces.ServiceInterfaces;

namespace Infrastructure.BackgroundJobs;

public sealed class EmergencyNotificationQueue : IEmergencyNotificationQueue
{
    private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>(
        new UnboundedChannelOptions { SingleReader = true });

    public ChannelReader<Guid> Reader => _channel.Reader;

    public void Enqueue(Guid accessId) => _channel.Writer.TryWrite(accessId);
}
