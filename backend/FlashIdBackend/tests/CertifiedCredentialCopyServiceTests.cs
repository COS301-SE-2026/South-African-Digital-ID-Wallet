using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.CertifiedCredentialCopies.Models;
using Domain.Entities;
using Domain.Enums;
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

    private static Credential CreateIdentityCredential(Guid? userId = null, CredentialStatus status = CredentialStatus.Active)
    {
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId ?? Guid.NewGuid(),
            SaId = "9000000000000",
            Names = "Kayla",
            Surname = "Patel",
            DateOfBirth = new DateTime(1990, 1, 1)
        };

        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Citizen = citizen,
            Status = status,
            IssuedBy = "Department of Home Affairs",
            IssueDate = new DateTime(2026, 7, 12)
        };

        credential.IdentityDocument = new IdentityDocument
        {
            Id = Guid.NewGuid(),
            CredentialId = credential.Id,
            Credential = credential,
            Citizenship = "South African",
            CountryOfBirth = "South Africa",
            Nationality = "South African",
            PhotoPath = "photos/kayla.jpg"
        };

        return credential;
    }

    private static Credential CreateDriversLicenseCredential(Guid? userId = null, CredentialStatus status = CredentialStatus.Active)
    {
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId ?? Guid.NewGuid(),
            SaId = "9000000000000",
            Names = "Kayla",
            Surname = "Patel",
            DateOfBirth = new DateTime(1990, 1, 1)
        };

        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Citizen = citizen,
            Status = status,
            IssuedBy = "RTMC",
            IssueDate = new DateTime(2026, 7, 12)
        };

        credential.DriversLicense = new DriversLicense
        {
            Id = Guid.NewGuid(),
            CredentialId = credential.Id,
            Credential = credential,
            LicenseNumber = "DL123456",
            LicenseCode = LicenseCode.B,
            Restrictions = "None",
            ExpiryDate = new DateTime(2031, 7, 12),
            CountryOfIssue = "South Africa",
            PhotoPath = "photos/kayla-license.jpg"
        };

        return credential;
    }

    private static CertifiedCredentialCopy CreateCertifiedCopy(Credential credential, CertifiedCopyStatus status = CertifiedCopyStatus.Active, DateTime? expiresAt = null)
    {
        return new CertifiedCredentialCopy
        {
            Id = Guid.NewGuid(),
            CitizenId = credential.CitizenId,
            CredentialId = credential.Id,
            Credential = credential,
            VerificationTokenHash = VerificationTokenHash,
            CredentialSnapshotHash = SnapshotHash,
            DocumentHash = DocumentHash,
            GeneratedAt = DateTime.UtcNow.AddMinutes(-5),
            ExpiresAt = expiresAt,
            Status = status
        };
    }

    private void SetupCryptography()
    {
        _cryptographyProvider.Setup(x => x.GenerateVerificationToken()).Returns(VerificationToken);

        _cryptographyProvider.Setup(x => x.HashVerificationToken(VerificationToken)).Returns(VerificationTokenHash);

        _cryptographyProvider.Setup(x => x.HashCredentialSnapshot(It.IsAny<CertifiedCredentialSnapshot>())).Returns(SnapshotHash);

        _cryptographyProvider.Setup(x => x.HashDocument(It.IsAny<byte[]>())).Returns(DocumentHash);
    }
}