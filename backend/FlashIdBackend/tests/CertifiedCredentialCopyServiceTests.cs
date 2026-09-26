using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
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
}