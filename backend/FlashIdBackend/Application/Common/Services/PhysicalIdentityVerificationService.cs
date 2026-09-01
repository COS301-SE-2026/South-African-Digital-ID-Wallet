using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.Verification.Dtos;
using Application.Features.Verification.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class PhysicalIdentityVerificationService : IPhysicalIdentityVerificationService
{
    private static readonly TimeSpan SessionLifetime = TimeSpan.FromMinutes(15);
    private readonly IPhysicalIdentityVerificationRepository _repository;
    private readonly IFaceLivenessServiceProvider _faceLivenessServiceProvider;
    private readonly IGovernmentRegistryGateway _governmentRegistryGateway;
    private readonly IPhotoStorageProvider _photoStorageProvider;

    public PhysicalIdentityVerificationService(IPhysicalIdentityVerificationRepository repository,
        IFaceLivenessServiceProvider faceLivenessServiceProvider, IGovernmentRegistryGateway governmentRegistryGateway, IPhotoStorageProvider photoStorageProvider)
    {
        _repository = repository;
        _faceLivenessServiceProvider = faceLivenessServiceProvider;
        _governmentRegistryGateway = governmentRegistryGateway;
        _photoStorageProvider = photoStorageProvider;
    }

    public async Task<StartPhysicalVerificationResponseDto> StartAsync(Guid userId,
        CancellationToken cancellationToken)
    {
        var existing = await _repository.GetActiveForUserAsync(userId, cancellationToken);
        if (existing is not null && existing.ExpiresAt > DateTime.UtcNow)
        {
            return new StartPhysicalVerificationResponseDto
            {
                VerificationId = existing.Id,
                Status = existing.Status,
                ExpiresAt = existing.ExpiresAt,
            };
        }

        if (existing is not null)
        {
            existing.Status = IdentityVerificationStatus.Expired;
            existing.UpdatedAt = DateTime.UtcNow;

            await _repository.SaveChangesAsync(cancellationToken);
        }

        var verification = new PhysicalIdentityVerification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = IdentityVerificationStatus.AwaitingConsent,
            ExpiresAt = DateTime.UtcNow.Add(SessionLifetime),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _repository.AddAsync(verification, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return new StartPhysicalVerificationResponseDto
        {
            VerificationId = verification.Id,
            Status = verification.Status,
            ExpiresAt = verification.ExpiresAt,
        };
    }


    public async Task<PhysicalVerificationResponseDto> GrantConsentAsync(Guid verificationId, Guid userId,
        CancellationToken cancellationToken)
    {
        var verification = await GetOwnedVerificationAsync(verificationId, userId, cancellationToken);

        EnsureNotExpired(verification);

        if (verification.Status != IdentityVerificationStatus.AwaitingConsent)
        {
            throw new InvalidOperationException("Verification is not awaiting consent.");
        }

        verification.ConsentGrantedAt = DateTime.UtcNow;
        verification.Status = IdentityVerificationStatus.AwaitingDocument;
        verification.UpdatedAt = DateTime.UtcNow;
        await _repository.SaveChangesAsync(cancellationToken);
        return PhysicalIdentityVerificationMapper.ToPhysicalVerificationResponseDto(verification); ;
    }

    public async Task<CreateLivenessSessionResult> CreateLivenessSessionAsync(Guid verificationId, Guid userId,
        string saId, CancellationToken cancellationToken)
    {

        var verification = await GetOwnedVerificationAsync(verificationId, userId, cancellationToken);
        EnsureNotExpired(verification);

        if (verification.ConsentGrantedAt is null)
        {
            throw new InvalidVerificationState("Consent granted at must be granted before biometric verification.");
        }

        if (verification.Status != IdentityVerificationStatus.AwaitingDocument)
        {
            throw new InvalidVerificationState("Verification is not ready for liveness.");
        }

        var citizen = await _governmentRegistryGateway.GetCitizenBySaIdAsync(saId);

        if (citizen is null)
        {
            verification.RegistryIdentityMatched = false;
            verification.Status = IdentityVerificationStatus.Failed;
            verification.FailureReason = "Identity could not be verified against the Government Registry.";

            await _repository.SaveChangesAsync(cancellationToken);

            throw new InvalidVerificationState("Identity could not be verified.");
        }

        verification.RegistryIdentityMatched = true;

        if (string.IsNullOrWhiteSpace(citizen.PhotoBlobName))
        {
            verification.Status = IdentityVerificationStatus.Failed;
            verification.FailureReason = "Government Registry portrait is unavailable.";

            await _repository.SaveChangesAsync(cancellationToken);

            throw new InvalidVerificationState("Government Registry portrait is unavailable.");
        }

        await using var referenceImage =
            await _photoStorageProvider.OpenReadAsync(citizen.PhotoBlobName, cancellationToken);

        if (referenceImage is null)
        {
            throw new InvalidOperationException("Government Registry portrait could not be retrieved.");
        }

        var contentType = GetImageContentType(citizen.PhotoBlobName);

        var azure = await _faceLivenessServiceProvider.CreateLivenessWithVerifySessionAsync(referenceImage, contentType, Guid.NewGuid(), cancellationToken);
        verification.AzureLivenessSessionId = azure.SessionId;
        verification.Status = IdentityVerificationStatus.AwaitingLiveness;
        verification.UpdatedAt = DateTime.UtcNow;
        await _repository.SaveChangesAsync(cancellationToken);

        return azure;
    }

    public async Task<PhysicalVerificationResponseDto> CompleteLivenessAsync(Guid verificationId, Guid userId,
        CancellationToken cancellationToken)
    {
        var verification = await GetOwnedVerificationAsync(verificationId, userId, cancellationToken);
        EnsureNotExpired(verification);

        if (string.IsNullOrWhiteSpace(verification.AzureLivenessSessionId))
        {
            throw new InvalidOperationException("Azure liveness session has not been created.");
        }

        var result = await _faceLivenessServiceProvider.GetLivenessWithVerifyResultAsync(verification.AzureLivenessSessionId, cancellationToken);

        if (!result.IsComplete)
        {
            return PhysicalIdentityVerificationMapper.ToPhysicalVerificationResponseDto(verification); ;
        }

        verification.LivenessPassed = result.LivenessPassed;
        verification.RegistryFaceMatched = result.FaceMatched;
        verification.UpdatedAt = DateTime.UtcNow;

        if (result.LivenessPassed == true && result.FaceMatched == true)
        {
            verification.Status = IdentityVerificationStatus.Verified;
            verification.VerifiedAt = DateTime.UtcNow;
            verification.FailureReason = null;
        }
        else
        {
            verification.Status = IdentityVerificationStatus.Failed;

            if (verification.LivenessPassed != true)
            {
                verification.FailureReason = "Liveness verification failed.";
            }
            else if (verification.RegistryFaceMatched != true)
            {
                verification.FailureReason = "Live face did not match the Government Registry portrait.";
            }
            else
            {
                verification.FailureReason = "Identity verification failed";
            }


        }
        await _repository.SaveChangesAsync(cancellationToken);
        return PhysicalIdentityVerificationMapper.ToPhysicalVerificationResponseDto(verification); ;
    }

    public async Task<PhysicalVerificationResponseDto> GetAsync(Guid verificationId, Guid userId,
        CancellationToken cancellationToken)
    {
        var verification = await GetOwnedVerificationAsync(verificationId, userId, cancellationToken);

        if (verification.ExpiresAt <= DateTime.UtcNow &&
            verification.Status != IdentityVerificationStatus.Verified &&
            verification.Status != IdentityVerificationStatus.Failed)
        {
            verification.Status = IdentityVerificationStatus.Expired;
            verification.UpdatedAt = DateTime.UtcNow;
            await _repository.SaveChangesAsync(cancellationToken);
        }

        return PhysicalIdentityVerificationMapper.ToPhysicalVerificationResponseDto(verification);
    }

    private static string GetImageContentType(string imageName)
    {
        return Path.GetExtension(imageName).ToLowerInvariant()
            switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };
    }

    private async Task<PhysicalIdentityVerification> GetOwnedVerificationAsync(Guid verificationId, Guid userId,
        CancellationToken cancellationToken)
    {
        var verification = await _repository.GetByIdAsync(verificationId, cancellationToken);

        if (verification is null || verification.UserId != userId)
        {
            throw new VerificationNotFoundException();
        }

        return verification;
    }

    private static void EnsureNotExpired(PhysicalIdentityVerification verification)
    {
        if (verification.ExpiresAt < DateTime.UtcNow || verification.Status == IdentityVerificationStatus.Expired)
        {
            throw new VerificationExpiredException();
        }

        if (verification.Status == IdentityVerificationStatus.Verified ||
            verification.Status == IdentityVerificationStatus.Failed)
        {
            throw new InvalidOperationException("Verification session has already completed.");
        }
    }


}