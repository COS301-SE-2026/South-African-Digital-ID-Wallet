using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Services;
using Application.Features.CertifiedCredentialCopies.Models;
using Application.Features.Credentials.Exceptions;
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

    [Fact]
    public async Task GenerateAsync_ValidIdentityCredential_ReturnsPdfAndPersistsCertifiedCopy()
    {
        var userId = Guid.NewGuid();
        var credential = CreateIdentityCredential(userId);

        _credentialRepository.Setup(x => x.GetByIdAsync(credential.Id)).ReturnsAsync(credential);

        SetupCryptography();

        _photoStorageProvider.Setup(x => x.OpenReadAsync(credential.IdentityDocument!.PhotoPath, It.IsAny<CancellationToken>())).ReturnsAsync(new MemoryStream(PhotoBytes));

        _pdfProvider.Setup(x => x.Generate(
                It.IsAny<CertifiedCredentialSnapshot>(),
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<DateTime>(),
                It.IsAny<byte[]?>())).Returns(PdfBytes);

        CertifiedCredentialCopy? savedCopy = null;

        _certifiedCopyRepository.Setup(x => x.AddAsync(It.IsAny<CertifiedCredentialCopy>()))
            .Callback<CertifiedCredentialCopy>(copy => savedCopy = copy).Returns(Task.CompletedTask);

        _certifiedCopyRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        var service = CreateService();

        var result = await service.GenerateAsync(credential.Id, userId);

        Assert.NotNull(savedCopy);
        Assert.Equal(PdfBytes, result.PdfBytes);
        Assert.Equal(savedCopy!.Id, result.CertifiedCopyId);
        Assert.Equal(credential.Id, savedCopy.CredentialId);
        Assert.Equal(credential.CitizenId, savedCopy.CitizenId);
        Assert.Equal(VerificationTokenHash, savedCopy.VerificationTokenHash);
        Assert.Equal(SnapshotHash, savedCopy.CredentialSnapshotHash);
        Assert.Equal(DocumentHash, savedCopy.DocumentHash);
        Assert.Equal(CertifiedCopyStatus.Active, savedCopy.Status);
        Assert.Null(savedCopy.ExpiresAt);
        Assert.Null(savedCopy.RevokedAt);
        Assert.Contains("Identity-Document", result.FileName);
        Assert.EndsWith(".pdf", result.FileName);

        _certifiedCopyRepository.Verify(x => x.AddAsync(It.IsAny<CertifiedCredentialCopy>()), Times.Once);
        _certifiedCopyRepository.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task GenerateAsync_ValidDriversLicense_ReturnsPdf()
    {
        var userId = Guid.NewGuid();

        var credential = CreateDriversLicenseCredential(userId);

        _credentialRepository.Setup(x => x.GetByIdAsync(credential.Id)).ReturnsAsync(credential);

        SetupCryptography();

        _photoStorageProvider.Setup(x => x.OpenReadAsync(credential.DriversLicense!.PhotoPath, It.IsAny<CancellationToken>())).ReturnsAsync(new MemoryStream(PhotoBytes));

        _pdfProvider.Setup(x => x.Generate(
                It.Is<CertifiedCredentialSnapshot>(snapshot => snapshot.CredentialType == "DriversLicense"),
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<DateTime>(),
                It.IsAny<byte[]?>())).Returns(PdfBytes);

        _certifiedCopyRepository.Setup(x => x.AddAsync(It.IsAny<CertifiedCredentialCopy>())).Returns(Task.CompletedTask);

        _certifiedCopyRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        var service = CreateService();

        var result = await service.GenerateAsync(credential.Id, userId);

        Assert.Equal(PdfBytes, result.PdfBytes);

        Assert.Contains("Drivers-License", result.FileName);

        _pdfProvider.Verify(x => x.Generate(It.Is<CertifiedCredentialSnapshot>(snapshot => snapshot.LicenseNumber == "DL123456" && snapshot.LicenseCode == "B"),
                It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<DateTime>(), It.IsAny<byte[]?>()), Times.Once);
    }

    [Fact]
    public async Task GenerateAsync_UsesPhotoFromBlobStorage()
    {
        var userId = Guid.NewGuid();

        var credential = CreateIdentityCredential(userId);

        _credentialRepository.Setup(x => x.GetByIdAsync(credential.Id)).ReturnsAsync(credential);

        SetupCryptography();

        _photoStorageProvider.Setup(x => x.OpenReadAsync("photos/kayla.jpg", It.IsAny<CancellationToken>())).ReturnsAsync(new MemoryStream(PhotoBytes));

        _pdfProvider.Setup(x => x.Generate(
                It.IsAny<CertifiedCredentialSnapshot>(),
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<DateTime>(),
                It.Is<byte[]?>(bytes => bytes != null && bytes.SequenceEqual(PhotoBytes)))).Returns(PdfBytes);

        _certifiedCopyRepository.Setup(x => x.AddAsync(It.IsAny<CertifiedCredentialCopy>())).Returns(Task.CompletedTask);

        _certifiedCopyRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        var service = CreateService();

        await service.GenerateAsync(credential.Id, userId);

        _photoStorageProvider.Verify(x => x.OpenReadAsync("photos/kayla.jpg", It.IsAny<CancellationToken>()), Times.Once);

        _pdfProvider.Verify(
            x => x.Generate(
                It.IsAny<CertifiedCredentialSnapshot>(),
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<DateTime>(),
                It.Is<byte[]?>(bytes => bytes != null && bytes.SequenceEqual(PhotoBytes))), Times.Once);
    }

    [Fact]
    public async Task GenerateAsync_PhotoNotFound_StillGeneratesPdfWithoutPhoto()
    {
        var userId = Guid.NewGuid();

        var credential = CreateIdentityCredential(userId);

        _credentialRepository.Setup(x => x.GetByIdAsync(credential.Id)).ReturnsAsync(credential);

        SetupCryptography();

        _photoStorageProvider.Setup(x => x.OpenReadAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync((Stream?)null);

        _pdfProvider.Setup(x => x.Generate(
                It.IsAny<CertifiedCredentialSnapshot>(),
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<DateTime>(),
                null)).Returns(PdfBytes);

        _certifiedCopyRepository.Setup(x => x.AddAsync(It.IsAny<CertifiedCredentialCopy>())).Returns(Task.CompletedTask);

        _certifiedCopyRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        var service = CreateService();

        var result = await service.GenerateAsync(credential.Id, userId);

        Assert.Equal(PdfBytes, result.PdfBytes);

        _pdfProvider.Verify(x => x.Generate(
                It.IsAny<CertifiedCredentialSnapshot>(),
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<DateTime>(),
                null), Times.Once);
    }

    [Fact]
    public async Task GenerateAsync_CredentialNotFound_ThrowsCredentialNotFoundException()
    {
        var credentialId = Guid.NewGuid();

        _credentialRepository.Setup(x => x.GetByIdAsync(credentialId)).ReturnsAsync((Credential?)null);

        var service = CreateService();

        await Assert.ThrowsAsync<CredentialNotFoundException>(() => service.GenerateAsync(credentialId, Guid.NewGuid()));
    }

    [Fact]
    public async Task GenerateAsync_CredentialOwnedByDifferentUser_ThrowsCredentialAccessDeniedException()
    {
        var ownerId = Guid.NewGuid();
        var requestingUserId = Guid.NewGuid();

        var credential = CreateIdentityCredential(ownerId);

        _credentialRepository.Setup(x => x.GetByIdAsync(credential.Id)).ReturnsAsync(credential);

        var service = CreateService();

        await Assert.ThrowsAsync<CredentialAccessDeniedException>(() => service.GenerateAsync(credential.Id, requestingUserId));
    }

    [Fact]
    public async Task GenerateAsync_InactiveCredential_ThrowsCredentialNotActiveException()
    {
        var userId = Guid.NewGuid();

        var credential = CreateIdentityCredential(userId, CredentialStatus.Inactive);

        _credentialRepository.Setup(x => x.GetByIdAsync(credential.Id)).ReturnsAsync(credential);

        var service = CreateService();

        await Assert.ThrowsAsync<CredentialNotActiveException>(() => service.GenerateAsync(credential.Id, userId));
    }

    [Fact]
    public async Task GenerateAsync_UnsupportedCredentialType_ThrowsInvalidOperationException()
    {
        var userId = Guid.NewGuid();

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            UserId = userId
        };

        var credential = new Credential
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Citizen = citizen,
            Status = CredentialStatus.Active
        };

        _credentialRepository.Setup(x => x.GetByIdAsync(credential.Id)).ReturnsAsync(credential);

        var service = CreateService();

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.GenerateAsync(credential.Id, userId));
    }

    [Fact]
    public async Task GenerateAsync_MissingFrontendUrl_ThrowsInvalidOperationException()
    {
        var userId = Guid.NewGuid();

        var credential = CreateIdentityCredential(userId);

        _credentialRepository.Setup(x => x.GetByIdAsync(credential.Id)).ReturnsAsync(credential);

        SetupCryptography();

        var service = CreateService(frontendBaseUrl: null);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>((() => service.GenerateAsync(credential.Id, userId)));

        Assert.Equal("Frontend URL is not configured.", exception.Message);
    }

    [Fact]
    public async Task GenerateAsync_GeneratesVerificationUrlUsingRawToken()
    {
        var userId = Guid.NewGuid();

        var credential = CreateIdentityCredential(userId);

        _credentialRepository.Setup(x => x.GetByIdAsync(credential.Id)).ReturnsAsync(credential);

        SetupCryptography();

        _photoStorageProvider.Setup(x => x.OpenReadAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync((Stream?)null);

        _pdfProvider.Setup(x => x.Generate(
                It.IsAny<CertifiedCredentialSnapshot>(),
                It.IsAny<Guid>(),
                $"{FrontendBaseUrl}/verify-certified-copy/{VerificationToken}",
                It.IsAny<DateTime>(),
                It.IsAny<byte[]?>())).Returns(PdfBytes);

        _certifiedCopyRepository.Setup(x => x.AddAsync(
                It.IsAny<CertifiedCredentialCopy>())).Returns(Task.CompletedTask);

        _certifiedCopyRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        var service = CreateService();

        await service.GenerateAsync(credential.Id, userId);

        _pdfProvider.Verify(x => x.Generate(
                It.IsAny<CertifiedCredentialSnapshot>(),
                It.IsAny<Guid>(),
                $"{FrontendBaseUrl}/verify-certified-copy/{VerificationToken}",
                It.IsAny<DateTime>(),
                It.IsAny<byte[]?>()), Times.Once);
    }

    [Fact]
    public async Task VerifyAsync_ValidToken_ReturnsValidIdentityCredential()
    {
        var credential = CreateIdentityCredential();

        var certifiedCopy = CreateCertifiedCopy(credential);

        _cryptographyProvider.Setup(x => x.HashVerificationToken(VerificationToken)).Returns(VerificationTokenHash);

        _certifiedCopyRepository.Setup(x => x.GetByVerificationTokenHashAsync(VerificationTokenHash)).ReturnsAsync(certifiedCopy);

        var service = CreateService();

        var result = await service.VerifyAsync(VerificationToken);

        Assert.True(result.IsValid);
        Assert.Equal("Valid", result.Status);
        Assert.Equal(certifiedCopy.Id, result.CertificationId);
        Assert.Equal("IdentityDocument", result.CredentialType);
        Assert.Equal("Kayla Patel", result.FullName);
        Assert.Equal("9000000000000", result.IdNumber);
        Assert.Equal("South African", result.Citizenship);
        Assert.Equal("South Africa", result.CountryOfBirth);
        Assert.Equal("South African", result.Nationality);
    }

    [Fact]
    public async Task VerifyAsync_ValidDriversLicense_ReturnsLicenseDetails()
    {
        var credential = CreateDriversLicenseCredential();

        var certifiedCopy = CreateCertifiedCopy(credential);

        _cryptographyProvider.Setup(x => x.HashVerificationToken(VerificationToken)).Returns(VerificationTokenHash);

        _certifiedCopyRepository.Setup(x => x.GetByVerificationTokenHashAsync(VerificationTokenHash)).ReturnsAsync(certifiedCopy);

        var service = CreateService();

        var result = await service.VerifyAsync(VerificationToken);

        Assert.True(result.IsValid);
        Assert.Equal("DriversLicense", result.CredentialType);
        Assert.Equal("DL123456", result.LicenseNumber);
        Assert.Equal("B", result.LicenseCode);
        Assert.Equal("None", result.Restrictions);
        Assert.Equal("South Africa", result.CountryOfIssue);
    }

    [Fact]
    public async Task VerifyAsync_UnknownToken_ReturnsInvalid()
    {
        _cryptographyProvider.Setup(x => x.HashVerificationToken(VerificationToken)).Returns(VerificationTokenHash);

        _certifiedCopyRepository.Setup(x => x.GetByVerificationTokenHashAsync(VerificationTokenHash)).ReturnsAsync((CertifiedCredentialCopy?)null);

        var service = CreateService();

        var result = await service.VerifyAsync(VerificationToken);

        Assert.False(result.IsValid);
        Assert.Equal("Invalid", result.Status);
    }

    [Fact]
    public async Task VerifyAsync_EmptyToken_ThrowsArgumentException()
    {
        var service = CreateService();

        await Assert.ThrowsAsync<ArgumentException>(() => service.VerifyAsync(""));
    }

    [Fact]
    public async Task VerifyAsync_RevokedCertification_ReturnsRevoked()
    {
        var credential = CreateIdentityCredential();

        var certifiedCopy = CreateCertifiedCopy(credential, CertifiedCopyStatus.Revoked);

        _cryptographyProvider.Setup(x => x.HashVerificationToken(VerificationToken)).Returns(VerificationTokenHash);

        _certifiedCopyRepository.Setup(x => x.GetByVerificationTokenHashAsync(VerificationTokenHash)).ReturnsAsync(certifiedCopy);

        var service = CreateService();

        var result = await service.VerifyAsync(VerificationToken);

        Assert.False(result.IsValid);
        Assert.Equal("Revoked", result.Status);
    }

    [Fact]
    public async Task VerifyAsync_ExpiredCertification_ReturnsExpired()
    {
        var credential = CreateIdentityCredential();

        var certifiedCopy = CreateCertifiedCopy(credential, expiresAt: DateTime.UtcNow.AddMinutes(-1));

        _cryptographyProvider.Setup(x => x.HashVerificationToken(VerificationToken)).Returns(VerificationTokenHash);

        _certifiedCopyRepository.Setup(x => x.GetByVerificationTokenHashAsync(VerificationTokenHash)).ReturnsAsync(certifiedCopy);

        var service = CreateService();

        var result = await service.VerifyAsync(VerificationToken);

        Assert.False(result.IsValid);
        Assert.Equal("Expired", result.Status);
    }

    [Fact]
    public async Task VerifyAsync_InactiveUnderlyingCredential_ReturnsCredentialInactive()
    {
        var credential = CreateIdentityCredential(status: CredentialStatus.Revoked);

        var certifiedCopy = CreateCertifiedCopy(credential);

        _cryptographyProvider.Setup(x => x.HashVerificationToken(VerificationToken)).Returns(VerificationTokenHash);

        _certifiedCopyRepository.Setup(x => x.GetByVerificationTokenHashAsync(VerificationTokenHash)).ReturnsAsync(certifiedCopy);

        var service = CreateService();

        var result = await service.VerifyAsync(VerificationToken);

        Assert.False(result.IsValid);
        Assert.Equal("CredentialInactive", result.Status);
    }

}