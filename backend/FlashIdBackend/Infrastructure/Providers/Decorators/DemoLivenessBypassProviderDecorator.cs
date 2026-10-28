using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.Verification.Dtos;

namespace Infrastructure.Providers.Decorators;

// Demo only: lets photos pass liveness while Azure's face match is still enforced
public class DemoLivenessBypassProviderDecorator : IFaceLivenessServiceProvider
{
    private readonly IFaceLivenessServiceProvider _inner;

    public DemoLivenessBypassProviderDecorator(IFaceLivenessServiceProvider inner)
    {
        _inner = inner;
    }

    public Task<CreateLivenessSessionResult> CreateLivenessWithVerifySessionAsync(Stream referenceImage, string contentType, Guid deviceCorrelationId, CancellationToken cancellationToken) => _inner.CreateLivenessWithVerifySessionAsync(referenceImage, contentType, deviceCorrelationId, cancellationToken);

    public async Task<LivenessVerificationResult> GetLivenessWithVerifyResultAsync(string sessionId, CancellationToken cancellationToken)
    {
        var result = await _inner.GetLivenessWithVerifyResultAsync(sessionId, cancellationToken);

        // Only override finished attempts so in-progress sessions keep polling
        if (result.IsComplete)
        {
            result.LivenessPassed = true;
        }

        return result;
    }
}
