namespace Application.Common.Interfaces.ProviderInterfaces;

public record LivenessSession(string SessionId, string AuthToken, string ReferenceQuality);

public record LivenessResult(
    bool IsReady,
    bool IsLive,
    bool IsIdentical,
    double MatchConfidence,
    string Decision
);

public interface ILivenessSessionProvider
{
    Task<LivenessSession> CreateVerifySessionAsync(
        Stream referenceImage, string deviceCorrelationId, CancellationToken cancellationToken
    );
    Task<LivenessResult> GetSessionResultAsync(string sessionId, CancellationToken cancellationToken);
}