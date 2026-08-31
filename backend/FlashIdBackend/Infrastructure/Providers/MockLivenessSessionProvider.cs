using Application.Common.Interfaces.ProviderInterfaces;

namespace Infrastructure.Providers;

public class MockLivenessSessionProvider : ILivenessSessionProvider
{
    public Task<LivenessSession> CreateVerifySessionAsync(
        Stream referenceImage, string deviceCorrelationId, CancellationToken cancellationToken)
        => Task.FromResult(new LivenessSession($"mock-{Guid.NewGuid()}", "mock-auth-token", "high"));

    public Task<LivenessResult> GetSessionResultAsync(string sessionId, CancellationToken cancellationToken)
        => Task.FromResult(new LivenessResult(true, true, true, 0.95, "realface"));
}