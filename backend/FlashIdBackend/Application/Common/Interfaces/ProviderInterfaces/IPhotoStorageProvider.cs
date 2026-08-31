namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IPhotoStorageProvider
{
    Task<string> GenerateReadSasUrlAsync(string blobName, TimeSpan ttl);
    Task<Stream> DownloadAsync(string blobName, CancellationToken cancellationToken);
}