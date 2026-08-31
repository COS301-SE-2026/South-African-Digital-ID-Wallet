using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.Verification.Dtos;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class PhysicalIdentityVerificationService : IPhysicalIdentityVerificationService
{
    private static readonly TimeSpan SessionLifetime = TimeSpan.FromMinutes(15);
    private readonly IPhysicalIdentityVerificationRepository _repository;
    private readonly IFaceLivenessServiceProvider _faceLivenessServiceProvider;

    public PhysicalIdentityVerificationService(IPhysicalIdentityVerificationRepository repository,
        IFaceLivenessServiceProvider faceLivenessServiceProvider)
    {
        _repository = repository;
        _faceLivenessServiceProvider = faceLivenessServiceProvider;
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
        Stream referenceImage, string contentType, CancellationToken cancellationToken)
    {

        var verification = await GetOwnedVerificationAsync(verificationId, userId, cancellationToken);
        EnsureNotExpired(verification);

        if (verification.ConsentGrantedAt is null)
        {
            throw new InvalidOperationException("ConsentGrantedAt must be granted before biometric verification.");
        }

        if (verification.Status != IdentityVerificationStatus.AwaitingDocument &&
            verification.Status != IdentityVerificationStatus.AwaitingLiveness)
        {
            throw new InvalidOperationException("Verification is not ready foe liveness.");
        }

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
        verification.CardFaceMatchedLiveFace = result.FaceMatched;
        verification.UpdatedAt = DateTime.UtcNow;

        if (result.LivenessPassed == true && result.FaceMatched == true)
        {
            verification.Status = IdentityVerificationStatus.Verified;
            verification.VerifiedAt = DateTime.UtcNow;
        }
        else
        {
            verification.Status = IdentityVerificationStatus.Failed;
            verification.FailureReason =
                result.LivenessPassed != true
                    ? "Liveness verification failed."
                    : "Live face did not match the identitty document.";


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

    private async Task<PhysicalIdentityVerification> GetOwnedVerificationAsync(Guid verificationId, Guid userId,
        CancellationToken cancellationToken)
    {
        var verification = await _repository.GetByIdAsync(verificationId, cancellationToken);

        if (verification is null || verification.UserId != userId)
        {
            throw new InvalidOperationException("Verification session could not be found.");
        }

        return verification;
    }

    private static void EnsureNotExpired(PhysicalIdentityVerification verification)
    {
        if (verification.ExpiresAt < DateTime.UtcNow || verification.Status == IdentityVerificationStatus.Expired)
        {
            throw new InvalidOperationException("Verification session has expired.");
        }

        if (verification.Status == IdentityVerificationStatus.Verified ||
            verification.Status == IdentityVerificationStatus.Failed)
        {
            throw new InvalidOperationException("Verification session has already completed.");
        }
    }


}