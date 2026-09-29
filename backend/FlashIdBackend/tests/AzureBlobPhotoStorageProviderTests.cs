using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Infrastructure.Providers;
using Microsoft.Extensions.Configuration;
using Microsoft.Identity.Client.Extensibility;

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

        return new ConfigurationBuilder().AddInMemoryCollection(values).Build();
    }

    [Fact]
    public void Constructor_MissingContainerName_ThrowsInvalidOperarionException()
    {
        var blobServiceClient = new BlobServiceClient(new Uri("https://example.blob.core.windows.net"));
        var config = CreateConfiguration(containerName: null);
        var ex = Assert.Throws<InvalidOperationException>(() => new AzureBlobPhotoStorageProvider(blobServiceClient, config));

        Assert.Contains("BlobStorage:ContainerName", ex.Message);
    }

    [Fact]
    public async Task GenerateReadSasUrlAsync_CannotGenerateSasUri_ThrowsInvalidOperarionException()
    {
        var containerUri = new Uri("https://example.blob.core.windows.net/citizen-photos");
        var expectedSasUri = new Uri("https://example.blob.core.windows.net/citizen-photos/mock-photo.png?sas=fake");
        var blobClient = new FakeBlobClient(new Uri(containerUri, "mock-photo.png"), canGenerateSasUri: false, sasUri: expectedSasUri);
        var containerClient = new FakeBlobContainerClient(containerUri, blobClient);
        var serviceClient = new FakeBlobServiceClient(new Uri("https://example.blob.core.windows.net"), containerClient);
        var config = CreateConfiguration("citizen-photos");
        var provider = new AzureBlobPhotoStorageProvider(serviceClient, config);

        await Assert.ThrowsAsync<InvalidOperationException>(() => provider.GenerateReadSasUrlAsync("mock-photo.png", TimeSpan.FromMinutes(5)));
    }

    [Fact]
    public async Task GenerateReadSasUrlAsync_WhenSasCanBeGenerated_ThrowsInvalidOperarionException()
    {
        var containerUri = new Uri("https://example.blob.core.windows.net/citizen-photos");
        var expectedSasUri = new Uri("https://example.blob.core.windows.net/citizen-photos/mock-photo.png?sv=fake-sas-token");
        var blobClient = new FakeBlobClient(new Uri(containerUri, "mock-photo.png"), canGenerateSasUri: true, sasUri: expectedSasUri);
        var containerClient = new FakeBlobContainerClient(containerUri, blobClient);
        var serviceClient = new FakeBlobServiceClient(new Uri("https://example.blob.core.windows.net"), containerClient);
        var config = CreateConfiguration("citizen-photos");
        var provider = new AzureBlobPhotoStorageProvider(serviceClient, config);

        var result = await provider.GenerateReadSasUrlAsync("mock-photo.png", TimeSpan.FromMinutes(5));

        Assert.Equal(expectedSasUri.ToString(), result);
    }
}