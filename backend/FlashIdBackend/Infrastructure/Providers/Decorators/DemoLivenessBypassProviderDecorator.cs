using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.Verification.Dtos;

namespace Infrastructure.Providers.Decorators;

// Demo only: lets photos pass liveness until a deadline while Azure's face match is still enforced
public class DemoLivenessBypassProviderDecorator : IFaceLivenessServiceProvider
{
    private readonly IFaceLivenessServiceProvider _inner;
    private readonly DateTimeOffset _bypassUntil;
    private readonly TimeProvider _timeProvider;

    public DemoLivenessBypassProviderDecorator(IFaceLivenessServiceProvider inner, DateTimeOffset bypassUntil, TimeProvider timeProvider)
    {
        _inner = inner;
        _bypassUntil = bypassUntil;
        _timeProvider = timeProvider;
    }

    public Task<CreateLivenessSessionResult> CreateLivenessWithVerifySessionAsync(Stream referenceImage, string contentType, Guid deviceCorrelationId, CancellationToken cancellationToken) => _inner.CreateLivenessWithVerifySessionAsync(referenceImage, contentType, deviceCorrelationId, cancellationToken);

    public async Task<LivenessVerificationResult> GetLivenessWithVerifyResultAsync(string sessionId, CancellationToken cancellationToken)
    {
        var result = await _inner.GetLivenessWithVerifyResultAsync(sessionId, cancellationToken);

        // Checked per request, so the bypass switches itself off at the deadline without a restart
        var bypassActive = _timeProvider.GetUtcNow() <= _bypassUntil;

        // Only override finished attempts so in-progress sessions keep polling
        if (bypassActive && result.IsComplete)
        {
            result.LivenessPassed = true;
        }

        return result;
    }
}
