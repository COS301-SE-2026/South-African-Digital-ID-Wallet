using Application.Features.Verification.Dtos;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IPhysicalIdentityVerificationService
{
    Task<StartPhysicalVerificationResponseDto> StartAsync(Guid verificationId, Guid userId, CancellationToken cancellationToken);

    Task<PhysicalVerificationResponseDto> GrantConsentAsync(Guid verificationId, Guid userId, CancellationToken cancellationToken);

    Task<CreateLivenessSessionResult> CreateLivenessSessionAsync(Guid verificationId, Guid userId, Stream referenceImage, string contentType, CancellationToken cancellationToken);

    Task<PhysicalVerificationResponseDto> CompleteLivenessAsync(Guid verificationId, Guid userId, CancellationToken cancellationToken);

    Task<PhysicalVerificationResponseDto> GetAsync(Guid verificationId, Guid userId, CancellationToken cancellationToken);
}