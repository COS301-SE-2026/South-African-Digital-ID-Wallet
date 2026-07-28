using Application.Common.Interfaces.ProviderInterfaces;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public class AzureBlobPhotoStorageProvider : IPhotoStorageProvider
{
    private readonly BlobContainerClient _containerClient;

    public AzureBlobPhotoStorageProvider(BlobServiceClient blobServiceClient, IConfiguration configuration)
    {
        var containerName = configuration["BlobStorage:ContainerName"] ?? throw new InvalidOperationException("BlobStorage:ContainerName not configured.");
        _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
    }

    public Task<string> GenerateReadSasUrlAsync(string blobName, TimeSpan ttl)
    {
        var blobClient = _containerClient.GetBlobClient(blobName);

        if (!blobClient.CanGenerateSasUri) throw new InvalidOperationException("BlobServiceClient must be constructed with an account key/connection string to mint SAS URIs.");

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _containerClient.Name,
            BlobName = blobName,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.Add(ttl),
        };

        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        return Task.FromResult(blobClient.GenerateSasUri(sasBuilder).ToString());
    }
}