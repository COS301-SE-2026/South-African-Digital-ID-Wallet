using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Application.Common.Interfaces.ProviderInterfaces;

namespace Infrastructure.Providers;

public class AzureLivenessSessionProvider : ILivenessSessionProvider
{
    private const string SessionsPath = "face/v1.2/detectLivenessWithVerify-sessions";
    private readonly HttpClient _httpClient;
    public AzureLivenessSessionProvider(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    public async Task<LivenessSession> CreateVerifySessionAsync(Stream referenceImage, string deviceCorrelationId, CancellationToken cancellationToken)
    {
        using var form = new MultipartFormDataContent {
            { new StringContent("Passive"), "livenessOperationMode" },
            { new StringContent(deviceCorrelationId), "deviceCorrelationId" },
            { new StringContent("false"), "sendResultsToClient" },
            { new StringContent("600"), "authTokenTimeToLiveInSeconds" },
        };
        var imageContent = new StreamContent(referenceImage);
        imageContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        form.Add(imageContent, "VerifyImage", "reference.jpg");
        var response = await _httpClient.PostAsync(SessionsPath, form, cancellationToken);
        response.EnsureSuccessStatusCode();
        var created = await response.Content.ReadFromJsonAsync<SessionResponse>(cancellationToken) ?? throw new InvalidOperationException("Azure returned no liveness session.");
        var quality = created.Results?.VerifyReferences?.FirstOrDefault()?.QualityForRecognition ?? "unknown";
        return new LivenessSession(created.SessionId!, created.AuthToken!, quality);
    }
    public async Task<LivenessResult> GetSessionResultAsync(string sessionId, CancellationToken cancellationToken)
    {
        var response = await _httpClient.GetAsync($"{SessionsPath}/{Uri.EscapeDataString(sessionId)}", cancellationToken);
        response.EnsureSuccessStatusCode();
        var session = await response.Content.ReadFromJsonAsync<SessionResponse>(cancellationToken);
        var outcome = session?.Results?.Attempts?.LastOrDefault()?.Result;
        if (outcome is null)
        {
            return new LivenessResult(IsReady: false, false, false, 0, session?.Status ?? "pending");
        }
        return new LivenessResult(
            IsReady: true,
            IsLive: string.Equals(outcome.LivenessDecision, "realface", StringComparison.OrdinalIgnoreCase),
            IsIdentical: outcome.VerifyResult?.IsIdentical ?? false,
            MatchConfidence: outcome.VerifyResult?.MatchConfidence ?? 0,
            Decision: outcome.LivenessDecision ?? "unknown"
        );
    }

    private sealed record SessionResponse(
        [property: JsonPropertyName("sessionId")] string? SessionId,
        [property: JsonPropertyName("authToken")] string? AuthToken,
        [property: JsonPropertyName("status")] string? Status,
        [property: JsonPropertyName("results")] SessionResults? Results
    );

    private sealed record SessionResults(
        [property: JsonPropertyName("attempts")] List<SessionAttempt>? Attempts,
        [property: JsonPropertyName("verifyReferences")] List<VerifyReference>? VerifyReferences
    );

    private sealed record VerifyReference(
        [property: JsonPropertyName("qualityForRecognition")] string? QualityForRecognition
    );

    private sealed record SessionAttempt(
        [property: JsonPropertyName("attemptStatus")] string? AttemptStatus,
        [property: JsonPropertyName("result")] AttemptResult? Result
    );

    private sealed record AttemptResult(
        [property: JsonPropertyName("livenessDecision")] string? LivenessDecision,
        [property: JsonPropertyName("verifyResult")] VerifyResultBody? VerifyResult
    );

    private sealed record VerifyResultBody(
        [property: JsonPropertyName("isIdentical")] bool IsIdentical,
        [property: JsonPropertyName("matchConfidence")] double MatchConfidence
    );
}