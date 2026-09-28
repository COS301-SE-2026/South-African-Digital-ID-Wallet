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
            throw new InvalidVerificationState("Consent cannot be granted because this verification is no longer awaiting consent.");
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

        var cleanSaId = saId?.Trim();

        if (string.IsNullOrWhiteSpace(cleanSaId) || cleanSaId.Length != 13 || !cleanSaId.All(char.IsDigit))
        {
            throw new InvalidVerificationState("A valid 13-digit South African ID number is required.");
        }

        var verification = await GetOwnedVerificationAsync(verificationId, userId, cancellationToken);
        EnsureNotExpired(verification);

        if (verification.ConsentGrantedAt is null)
        {
            throw new InvalidVerificationState("Consent must be granted before biometric verification.");
        }

        if (
            verification.Status != IdentityVerificationStatus.AwaitingDocument &&
            verification.Status != IdentityVerificationStatus.AwaitingLiveness
        )
        {
            throw new InvalidVerificationState(
                "A liveness session cannot be created from the current verification state.");
        }

        if (
            !string.IsNullOrWhiteSpace(verification.SubmittedSaId) &&
            verification.SubmittedSaId != cleanSaId
        )
        {
            throw new InvalidVerificationState(
                "This verification session is already associated with a different South African ID number.");
        }

        var citizen = await _governmentRegistryGateway.GetCitizenBySaIdAsync(cleanSaId);

        if (citizen is null)
        {
            verification.RegistryIdentityMatched = false;
            verification.Status = IdentityVerificationStatus.Failed;
            verification.FailureReason = "Identity could not be verified against the Government Registry.";
            verification.UpdatedAt = DateTime.UtcNow;

            await _repository.SaveChangesAsync(cancellationToken);

            throw new InvalidVerificationState("Identity could not be verified against the Government Registry.");
        }

        verification.RegistryIdentityMatched = true;
        verification.SubmittedSaId = citizen.SaId;

        if (string.IsNullOrWhiteSpace(citizen.PhotoBlobName))
        {
            verification.Status = IdentityVerificationStatus.Failed;
            verification.FailureReason = "Government Registry portrait is unavailable.";

            verification.UpdatedAt = DateTime.UtcNow;

            await _repository.SaveChangesAsync(cancellationToken);

            throw new InvalidVerificationState("Government Registry portrait is unavailable.");
        }

        await using var referenceImage =
            await _photoStorageProvider.OpenReadAsync(citizen.PhotoBlobName, cancellationToken);

        if (referenceImage is null)
        {
            verification.Status = IdentityVerificationStatus.Failed;
            verification.FailureReason =
                "Government Registry portrait could not be retrieved.";
            verification.UpdatedAt = DateTime.UtcNow;

            await _repository.SaveChangesAsync(cancellationToken);
            throw new InvalidVerificationState("Government Registry portrait could not be retrieved.");
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
            throw new InvalidVerificationState(
                "Liveness verification has not been started for this session.");
        }

        var result = await _faceLivenessServiceProvider.GetLivenessWithVerifyResultAsync(verification.AzureLivenessSessionId, cancellationToken);

        if (!result.IsComplete)
        {
            return PhysicalIdentityVerificationMapper.ToPhysicalVerificationResponseDto(verification); ;
        }

        verification.LivenessPassed = result.LivenessPassed;
        verification.RegistryFaceMatched = result.FaceMatched;
        verification.UpdatedAt = DateTime.UtcNow;

        var verificationSucceeded = verification.RegistryIdentityMatched == true && verification.LivenessPassed == true && verification.RegistryFaceMatched == true;


        if (!verificationSucceeded)
        {
            verification.Status = IdentityVerificationStatus.Failed;

            if (verification.RegistryIdentityMatched != true)
            {
                verification.FailureReason = "Government Registry identity verification failed.";
            }
            else if (verification.LivenessPassed == false)
            {
                verification.FailureReason = "Liveness verification failed.";
            }
            else if (verification.LivenessPassed is null)
            {
                verification.FailureReason = "A liveness verification result could not be obtained.";
            }
            else if (verification.RegistryFaceMatched == false)
            {
                verification.FailureReason =
                    "Live face did not match the Government Registry portrait.";
            }
            else
            {
                verification.FailureReason =
                    "A face verification result could not be obtained.";
            }

            await _repository.SaveChangesAsync(cancellationToken);
            return PhysicalIdentityVerificationMapper.ToPhysicalVerificationResponseDto(verification);
        }

        if (string.IsNullOrWhiteSpace(verification.SubmittedSaId))
        {
            throw new InvalidVerificationState("No identity is associated with this verification session.");
        }

        var registryCitizen = await _governmentRegistryGateway.GetCitizenBySaIdAsync(verification.SubmittedSaId);

        if (registryCitizen is null)
        {
            throw new InvalidVerificationState("Government Registry identity could not be found.");
        }

        var flashIdCitizen = await _repository.GetCitizenBySaIdAsync(registryCitizen.SaId, cancellationToken);

        var existingForUser = await _repository.GetCitizenByUserIdAsync(userId, cancellationToken);

        if (flashIdCitizen is not null &&
            flashIdCitizen.UserId is not null &&
            flashIdCitizen.UserId != userId)
        {
            verification.Status = IdentityVerificationStatus.Failed;

            verification.FailureReason = "This identity is already linked to another account.";

            await _repository.SaveChangesAsync(cancellationToken);

            throw new InvalidVerificationState("This identity is already linked to another account.");
        }

        if (existingForUser is not null &&
            (flashIdCitizen is null ||
             existingForUser.Id != flashIdCitizen.Id))
        {
            verification.Status = IdentityVerificationStatus.Failed;

            verification.FailureReason = "This account is already linked to another identity.";

            await _repository.SaveChangesAsync(cancellationToken);

            throw new InvalidVerificationState("This account is already linked to another identity.");
        }

        if (flashIdCitizen is null)
        {
            flashIdCitizen = new Citizen
            {
                Id = Guid.NewGuid(),

                SaId = registryCitizen.SaId,
                Names = registryCitizen.Names,
                Surname = registryCitizen.Surname,
                DateOfBirth = registryCitizen.DateOfBirth,

                Gender = Enum.TryParse<Gender>(registryCitizen.Gender, true, out var parsedGender) ? parsedGender : Gender.Unspecified,

                UserId = userId,

                Status = CitizenStatus.Verified,

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.AddCitizenAsync(flashIdCitizen, cancellationToken);
        }
        else
        {
            flashIdCitizen.UserId = userId;

            flashIdCitizen.Status = CitizenStatus.Verified;

            flashIdCitizen.UpdatedAt = DateTime.UtcNow;
        }

        verification.Status = IdentityVerificationStatus.Verified;

        verification.VerifiedAt = DateTime.UtcNow;

        verification.FailureReason = null;

        await _repository.SaveChangesAsync(cancellationToken);

        return PhysicalIdentityVerificationMapper.ToPhysicalVerificationResponseDto(verification);
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
            throw new InvalidVerificationState(
                "This verification session has already completed.");
        }
    }


}