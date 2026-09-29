namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IPortraitProcessor
{
    // Produces the 160x160 colour WebP that travels inside an offline credential (D-018)
    // Bytes in, bytes out: no storage, so the caller  decides where the result lives
    Task<byte[]> ToOfflinePortraitAsync(Stream source, CancellationToken cancellationToken);
}
