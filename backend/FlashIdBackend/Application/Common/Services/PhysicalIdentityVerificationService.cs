using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
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

    public async Task<StartPhysicalVerificationResponseDto> StartAsync(Guid verificationId, Guid userId,
        CancellationToken cancellationToken)
    {
        var existing = await _repository.GetActiveForUserAsync(userId, cancellationToken);
        if (existing is not null && existing.ExpiresAt > DateTime.UtcNow)
        {
            return new StartPhysicalVerificationResponseDto
            {
                VerificationId = verificationId,
                Status = existing.Status,
                ExpiresAt = existing.ExpiresAt,
            };
        }

        if (existing is not null)
        {
            existing.Status = IdentityVerificationStatus.Expired;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.ExpiresAt = existing.ExpiresAt;

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


        return new PhysicalVerificationResponseDto();

    }

    public async Task<CreateLivenessSessionResult> CreateLivenessSessionAsync(Guid verificationId, Guid userId,
        Stream referenceImage, string contentType, CancellationToken cancellationToken)
    {
        return new CreateLivenessSessionResult();
    }

    public async Task<PhysicalVerificationResponseDto> CompleteLivenessAsync(Guid verificationId, Guid userId,
        CancellationToken cancellationToken)
    {
        return new PhysicalVerificationResponseDto();
    }

    public async Task<PhysicalVerificationResponseDto> GetAsync(Guid verificationId, Guid userId,
        CancellationToken cancellationToken)
    {
        return new PhysicalVerificationResponseDto();
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

    private static PhysicalVerificationResponseDto Map(PhysicalIdentityVerification verification)
    {
        return new PhysicalVerificationResponseDto
        {
            VerificationId = verification.Id,
            Status = verification.Status,
            LivenessPassed = verification.LivenessPassed,
            CardFaceMatchedLiveFace = verification.CardFaceMatchedLiveFace,
            ExpiresAt = verification.ExpiresAt,
            VerifiedAt = verification.CreatedAt,
            FailureReason = verification.FailureReason,
        };
    }
}