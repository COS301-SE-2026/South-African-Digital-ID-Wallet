using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Infrastructure.Providers;
using Microsoft.Extensions.Configuration;

namespace tests;

public class AzureBlobPhotoStorageProviderTests
{
    private sealed class FakeBlobClient : BlobClient
    {
        private readonly bool _canGenerateSasUri;
        private readonly Uri _sasUri;

        public FakeBlobClient(Uri blobUri, bool canGenerateSasUri, Uri sasUri) : base(blobUri)
        {
            _canGenerateSasUri = canGenerateSasUri;
            _sasUri = sasUri;
        }

        public override bool CanGenerateSasUri => _canGenerateSasUri;
        public override Uri GenerateSasUri(BlobSasBuilder builder) => _sasUri;
    }

    private sealed class FakeBlobContainerClient : BlobContainerClient
    {
        private readonly BlobClient _blobClient;

        public FakeBlobContainerClient(Uri containerUri, BlobClient blobClient) : base(containerUri)
        {
            _blobClient = blobClient;
        }

        public override BlobClient GetBlobClient(string blobName) => _blobClient;
    }

    private sealed class FakeBlobServiceClient : BlobServiceClient
    {
        private readonly BlobContainerClient _containerClient;

        public FakeBlobServiceClient(Uri serviceUri, BlobContainerClient containerClient) : base(serviceUri)
        {
            _containerClient = containerClient;
        }

        public override BlobContainerClient GetBlobContainerClient(string blobContainerName) => _containerClient;
    }

    private static IConfiguration CreateConfiguration(string? containerName)
    {
        var values = new Dictionary<string, string?>();

        if (containerName is not null)
        {
            values["BlobStorage:ContainerName"] = containerName;
        }

        return new ConfigurationBinder().AddInMemoryCollection(values).Build();
    }
}