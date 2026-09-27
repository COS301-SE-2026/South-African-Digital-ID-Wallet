using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.CertifiedCredentialCopies.DTOs;
using Application.Features.CertifiedCredentialCopies.Models;
using Application.Features.Credentials.Enums;
using Application.Features.Credentials.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace Application.Common.Services;

public class CertifiedCredentialCopyService : ICertifiedCredentialCopyService
{
    private readonly ICredentialRepository _credentialRepository;
    private readonly ICertifiedCredentialCopyRepository _certifiedCopyRepository;
    private readonly ICertifiedCopyCryptographyProvider _cryptographyProvider;
    private readonly ICertifiedCopyPdfProvider _pdfProvider;
    private readonly CertifiedCredentialSnapshotMapper _snapshotMapper;
    private readonly IConfiguration _configuration;
    private readonly IPhotoStorageProvider _photoStorageProvider;

    public CertifiedCredentialCopyService(
        ICredentialRepository credentialRepository,
        ICertifiedCredentialCopyRepository certifiedCopyRepository,
        ICertifiedCopyCryptographyProvider cryptographyProvider,
        ICertifiedCopyPdfProvider pdfProvider,
        CertifiedCredentialSnapshotMapper snapshotMapper,
        IConfiguration configuration,
        IPhotoStorageProvider photoStorageProvider)
    {
        _credentialRepository = credentialRepository;
        _certifiedCopyRepository = certifiedCopyRepository;
        _cryptographyProvider = cryptographyProvider;
        _pdfProvider = pdfProvider;
        _snapshotMapper = snapshotMapper;
        _configuration = configuration;
        _photoStorageProvider = photoStorageProvider;
    }

    public async Task<GeneratedCertifiedCopyResultDto> GenerateAsync(Guid credentialId, CredentialType credentialType, Guid requestingUserId)
    {
        var credential = await _credentialRepository.GetByIdAsync(credentialId);

        if (credential is null)
            throw new CredentialNotFoundException(credentialId);

        if (credential.Citizen.UserId != requestingUserId)
            throw new CredentialAccessDeniedException();

        if (credential.Status != CredentialStatus.Active)
            throw new CredentialNotActiveException();

        var snapshot = CreateSnapshot(credential, credentialType);

        var certifiedCopyId = Guid.NewGuid();

        var generatedAt = DateTime.UtcNow;

        var verificationToken = _cryptographyProvider.GenerateVerificationToken();

        var verificationTokenHash = _cryptographyProvider.HashVerificationToken(verificationToken);

        var credentialSnapshotHash = _cryptographyProvider.HashCredentialSnapshot(snapshot);

        var verificationUrl = CreateVerificationUrl(verificationToken);

        var photoBytes = await GetPhotoBytesAsync(snapshot.PhotoPath);

        var pdfBytes = _pdfProvider.Generate(snapshot, certifiedCopyId, verificationUrl, generatedAt, photoBytes);

        var documentHash = _cryptographyProvider.HashDocument(pdfBytes);

        var certifiedCopy = new CertifiedCredentialCopy
        {
            Id = certifiedCopyId,
            CitizenId = credential.CitizenId,
            CredentialId = credential.Id,

            VerificationTokenHash = verificationTokenHash,
            CredentialSnapshotHash = credentialSnapshotHash,
            DocumentHash = documentHash,

            GeneratedAt = generatedAt,
            ExpiresAt = null,
            RevokedAt = null,

            Status = CertifiedCopyStatus.Active
        };

        await _certifiedCopyRepository.AddAsync(certifiedCopy);
        await _certifiedCopyRepository.SaveChangesAsync();

        return new GeneratedCertifiedCopyResultDto
        {
            CertifiedCopyId = certifiedCopyId,
            PdfBytes = pdfBytes,
            FileName = CreateFileName(
                snapshot,
                certifiedCopyId),
            GeneratedAt = generatedAt
        };
    }

    private CertifiedCredentialSnapshot CreateSnapshot(Credential credential, CredentialType credentialType)
    {
        return credentialType switch
        {
            CredentialType.IdentityDocument when credential.IdentityDocument is not null
                => _snapshotMapper.MapIdentityDocument(credential),

            CredentialType.DriversLicense when credential.DriversLicense is not null
                => _snapshotMapper.MapDriversLicense(credential),

            CredentialType.IdentityDocument
                => throw new InvalidOperationException("No identity document is associated with this credential."),

            CredentialType.DriversLicense
                => throw new InvalidOperationException("No driver's licence is associated with this credential."),

            _ => throw new ArgumentOutOfRangeException(nameof(credentialType))
        };
    }

    private string CreateVerificationUrl(string verificationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(verificationToken);

        var frontendUrl = _configuration["Activation:FrontendBaseUrl"];

        if (string.IsNullOrWhiteSpace(frontendUrl))
        {
            throw new InvalidOperationException("Frontend URL is not configured.");
        }

        var baseUrl = frontendUrl.TrimEnd('/');

        var token = Uri.EscapeDataString(verificationToken);

        return $"{baseUrl}/verify-certified-copy/{token}";
    }

    private async Task<byte[]?> GetPhotoBytesAsync(string? photoPath)
    {
        if (string.IsNullOrWhiteSpace(photoPath))
            return null;

        await using var photoStream = await _photoStorageProvider.OpenReadAsync(photoPath, CancellationToken.None);

        if (photoStream is null)
            return null;

        using var memoryStream = new MemoryStream();

        await photoStream.CopyToAsync(memoryStream);

        return memoryStream.ToArray();
    }

    private static string CreateFileName(CertifiedCredentialSnapshot snapshot, Guid certificationId)
    {
        var credentialType = snapshot.CredentialType == "DriversLicense" ? "Drivers-License" : "Identity-Document";

        return $"FlashID-Certified-{credentialType}-{certificationId:N}.pdf";
    }

    public async Task<VerifyCertifiedCopyResponseDto> VerifyAsync(string verificationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(verificationToken);

        var tokenHash = _cryptographyProvider.HashVerificationToken(verificationToken);

        var certifiedCopy = await _certifiedCopyRepository.GetByVerificationTokenHashAsync(tokenHash);

        if (certifiedCopy is null)
        {
            return new VerifyCertifiedCopyResponseDto
            {
                IsValid = false,
                Status = "Invalid"
            };
        }

        if (certifiedCopy.Status == CertifiedCopyStatus.Revoked)
        {
            return new VerifyCertifiedCopyResponseDto
            {
                IsValid = false,
                Status = "Revoked",
                CertificationId = certifiedCopy.Id,
                GeneratedAt = certifiedCopy.GeneratedAt,
                ExpiresAt = certifiedCopy.ExpiresAt
            };
        }

        if (certifiedCopy.ExpiresAt.HasValue && certifiedCopy.ExpiresAt.Value <= DateTime.UtcNow)
        {
            return new VerifyCertifiedCopyResponseDto
            {
                IsValid = false,
                Status = "Expired",
                CertificationId = certifiedCopy.Id,
                GeneratedAt = certifiedCopy.GeneratedAt,
                ExpiresAt = certifiedCopy.ExpiresAt
            };
        }

        var credential = certifiedCopy.Credential;

        if (credential.Status != CredentialStatus.Active)
        {
            return new VerifyCertifiedCopyResponseDto
            {
                IsValid = false,
                Status = "CredentialInactive",
                CertificationId = certifiedCopy.Id,
                GeneratedAt = certifiedCopy.GeneratedAt,
                ExpiresAt = certifiedCopy.ExpiresAt
            };
        }

        var snapshot = ResolveCertifiedSnapshot(certifiedCopy);

        return new VerifyCertifiedCopyResponseDto
        {
            IsValid = true,
            Status = "Valid",

            CertificationId = certifiedCopy.Id,
            GeneratedAt = certifiedCopy.GeneratedAt,
            ExpiresAt = certifiedCopy.ExpiresAt,

            CredentialType = snapshot.CredentialType,
            IssuedBy = snapshot.IssuedBy,
            IssueDate = snapshot.IssueDate,

            FullName = snapshot.FullName,
            IdNumber = snapshot.IdNumber,
            DateOfBirth = snapshot.DateOfBirth,

            Citizenship = snapshot.Citizenship,
            CountryOfBirth = snapshot.CountryOfBirth,
            Nationality = snapshot.Nationality,

            LicenseNumber = snapshot.LicenseNumber,
            LicenseCode = snapshot.LicenseCode,
            Restrictions = snapshot.Restrictions,
            ExpiryDate = snapshot.ExpiryDate,
            CountryOfIssue = snapshot.CountryOfIssue
        };
    }

    public async Task<VerifyCertifiedCopyDocumentResponseDto> VerifyDocumentAsync(string verificationToken,
        byte[] documentBytes)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(verificationToken);
        ArgumentNullException.ThrowIfNull(documentBytes);

        if (documentBytes.Length == 0)
            throw new ArgumentException("Document cannot be empty.", nameof(documentBytes));

        var tokenHash = _cryptographyProvider.HashVerificationToken(verificationToken);

        var certifiedCopy = await _certifiedCopyRepository.GetByVerificationTokenHashAsync(tokenHash);

        if (certifiedCopy is null)
        {
            return new VerifyCertifiedCopyDocumentResponseDto
            {
                IsValid = false,
                DocumentIntegrityValid = false,
                Status = "Invalid",
                Message = "The certified copy could not be verified."
            };
        }

        var documentIntegrityValid = _cryptographyProvider.VerifyDocumentHash(documentBytes, certifiedCopy.DocumentHash);

        if (!documentIntegrityValid)
        {
            return new VerifyCertifiedCopyDocumentResponseDto
            {
                IsValid = false,
                DocumentIntegrityValid = false,
                Status = "DocumentIntegrityFailed",
                CertificationId = certifiedCopy.Id,
                GeneratedAt = certifiedCopy.GeneratedAt,
                ExpiresAt = certifiedCopy.ExpiresAt,
                Message = "The uploaded document does not match the original certified copy generated by FlashID."
            };
        }

        if (certifiedCopy.Status == CertifiedCopyStatus.Revoked)
        {
            return new VerifyCertifiedCopyDocumentResponseDto
            {
                IsValid = false,
                DocumentIntegrityValid = true,
                Status = "Revoked",
                CertificationId = certifiedCopy.Id,
                GeneratedAt = certifiedCopy.GeneratedAt,
                ExpiresAt = certifiedCopy.ExpiresAt,
                Message = "The document is authentic, but its certification has been revoked."
            };
        }

        if (certifiedCopy.ExpiresAt.HasValue && certifiedCopy.ExpiresAt.Value <= DateTime.UtcNow)
        {
            return new VerifyCertifiedCopyDocumentResponseDto
            {
                IsValid = false,
                DocumentIntegrityValid = true,
                Status = "Expired",
                CertificationId = certifiedCopy.Id,
                GeneratedAt = certifiedCopy.GeneratedAt,
                ExpiresAt = certifiedCopy.ExpiresAt,
                Message =
                    "The document is authentic, but its certification has expired."
            };
        }

        var credential = certifiedCopy.Credential;

        if (credential.Status != CredentialStatus.Active)
        {
            return new VerifyCertifiedCopyDocumentResponseDto
            {
                IsValid = false,
                DocumentIntegrityValid = true,
                Status = "CredentialInactive",
                CertificationId = certifiedCopy.Id,
                GeneratedAt = certifiedCopy.GeneratedAt,
                ExpiresAt = certifiedCopy.ExpiresAt,
                Message = "The document is authentic, but the underlying credential is no longer active."
            };
        }

        var snapshot = ResolveCertifiedSnapshot(certifiedCopy);

        return new VerifyCertifiedCopyDocumentResponseDto
        {
            IsValid = true,
            DocumentIntegrityValid = true,
            Status = "Valid",
            CertificationId = certifiedCopy.Id,
            CredentialType = snapshot.CredentialType,
            FullName = snapshot.FullName,
            GeneratedAt = certifiedCopy.GeneratedAt,
            ExpiresAt = certifiedCopy.ExpiresAt,
            Message = "The document is a valid and unmodified FlashID certified copy."
        };
    }

    private CertifiedCredentialSnapshot ResolveCertifiedSnapshot(CertifiedCredentialCopy certifiedCopy)
    {
        var credential = certifiedCopy.Credential;

        if (credential.IdentityDocument is not null)
        {
            var snapshot = _snapshotMapper.MapIdentityDocument(credential);

            if (_cryptographyProvider.VerifyCredentialSnapshotHash(snapshot, certifiedCopy.CredentialSnapshotHash))
                return snapshot;
        }

        if (credential.DriversLicense is not null)
        {
            var snapshot = _snapshotMapper.MapDriversLicense(credential);

            if (_cryptographyProvider.VerifyCredentialSnapshotHash(snapshot, certifiedCopy.CredentialSnapshotHash))
                return snapshot;
        }

        throw new InvalidOperationException(
            $"The credential snapshot for certified copy {certifiedCopy.Id} could not be resolved.");
    }
}