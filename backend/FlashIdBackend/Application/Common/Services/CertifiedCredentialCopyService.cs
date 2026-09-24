using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.CertifiedCredentialCopies.DTOs;
using Application.Features.CertifiedCredentialCopies.Models;
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

    public async Task<GeneratedCertifiedCopyResultDto> GenerateAsync(
        Guid credentialId, Guid requestingUserId)
    {
        var credential = await _credentialRepository.GetByIdAsync(credentialId);

        if (credential is null)
            throw new CredentialNotFoundException(credentialId);

        if (credential.Citizen.UserId != requestingUserId)
            throw new CredentialAccessDeniedException();

        if (credential.Status != CredentialStatus.Active)
            throw new CredentialNotActiveException();

        var snapshot = CreateSnapshot(credential);

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

    private CertifiedCredentialSnapshot CreateSnapshot(
        Credential credential)
    {
        if (credential.IdentityDocument is not null)
            return _snapshotMapper.MapIdentityDocument(credential);

        if (credential.DriversLicense is not null)
            return _snapshotMapper.MapDriversLicense(credential);

        throw new InvalidOperationException(
            "Credential type is not supported for certified copies.");
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

        await using var photoStream =
            await _photoStorageProvider.OpenReadAsync(
                photoPath,
                CancellationToken.None);

        if (photoStream is null)
            return null;

        using var memoryStream = new MemoryStream();

        await photoStream.CopyToAsync(memoryStream);

        return memoryStream.ToArray();
    }

    private static string CreateFileName(
        CertifiedCredentialSnapshot snapshot,
        Guid certificationId)
    {
        var credentialType =
            snapshot.CredentialType == "DriversLicense" ? "Drivers-License" : "Identity-Document";

        return $"FlashID-Certified-{credentialType}-{certificationId:N}.pdf";
    }

    public Task<VerifyCertifiedCopyResponseDto> VerifyAsync(string verificationToken)
    {
        throw new NotImplementedException();
    }

    public Task<VerifyCertifiedCopyDocumentResponseDto> VerifyDocumentAsync(string verificationToken, byte[] documentBytes)
    {
        throw new NotImplementedException();
    }
}