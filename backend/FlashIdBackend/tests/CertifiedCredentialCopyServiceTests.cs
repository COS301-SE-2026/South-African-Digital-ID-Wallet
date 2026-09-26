using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace tests;

public class CertifiedCredentialCopyServiceTests
{
    private const string FrontendBaseUrl = "http://localhost:3000";
    private const string VerificationToken = "test-verification-token";
    private const string VerificationTokenHash = "TOKEN_HASH";
    private const string SnapshotHash = "SNAPSHOT_HASH";
    private const string DocumentHash = "DOCUMENT_HASH";

    private static readonly byte[] PdfBytes = "%PDF-test-document"u8.ToArray();

    private static readonly byte[] PhotoBytes = "fake-photo-bytes"u8.ToArray();

    private readonly Mock<ICredentialRepository> _credentialRepository = new();
    private readonly Mock<ICertifiedCredentialCopyRepository> _certifiedCopyRepository = new();
    private readonly Mock<ICertifiedCopyCryptographyProvider> _cryptographyProvider = new();
    private readonly Mock<ICertifiedCopyPdfProvider> _pdfProvider = new();
    private readonly Mock<IPhotoStorageProvider> _photoStorageProvider = new();

    private CertifiedCredentialCopyService CreateService(string? frontendBaseUrl = FrontendBaseUrl)
    {
        var values = new Dictionary<string, string?>();

        if (frontendBaseUrl is not null)
        {
            values["Activation:FrontendBaseUrl"] = frontendBaseUrl;
        }

        var configuration = new ConfigurationBuilder().AddInMemoryCollection(values).Build();

        return new CertifiedCredentialCopyService(
            _credentialRepository.Object,
            _certifiedCopyRepository.Object,
            _cryptographyProvider.Object,
            _pdfProvider.Object,
            new CertifiedCredentialSnapshotMapper(),
            configuration,
            _photoStorageProvider.Object);
    }
}