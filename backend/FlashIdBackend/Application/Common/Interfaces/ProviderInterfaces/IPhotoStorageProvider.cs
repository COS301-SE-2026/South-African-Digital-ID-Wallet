namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IPhotoStorageProvider
{
    Task<string> UploadPhotoAsync(byte[] photoBytes, string blobName, CancellationToken cancellationToken = default);
    Task<string> GenerateReadSasUrlAsync(string blobName, TimeSpan ttl);
}