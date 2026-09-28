using Application.Features.Verification.Dtos;

namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IFaceLivenessServiceProvider
{
    Task<CreateLivenessSessionResult> CreateLivenessWithVerifySessionAsync(Stream referenceImage, string contentType,
        Guid deviceCorrelationId, CancellationToken cancellationToken);

    Task<LivenessVerificationResult> GetLivenessWithVerifyResultAsync(string sessionId, CancellationToken cancellationToken);

}