using System.Text.Json;
using Azure;
using Azure.AI.Vision.Face;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;
using AppLivenessResult = Application.Features.Verification.Dtos.CreateLivenessSessionResult;
using AppVerificationResult = Application.Features.Verification.Dtos.LivenessVerificationResult;

namespace Infrastructure.Providers;

public class AzureFaceLivenessServiceProvider : IFaceLivenessServiceProvider
{
    private readonly FaceSessionClient _sessionClient;
    private readonly HttpClient _httpClient;
    private readonly string _endpoint;
    private readonly string _apiKey;

    public AzureFaceLivenessServiceProvider(IConfiguration configuration)
    {
        _endpoint =
            configuration["AzureFace:Endpoint"] ?? throw new InvalidOperationException("Azure Face endpoint is not configured");

        _apiKey =
            configuration["AzureFace:ApiKey"] ?? throw new InvalidOperationException("Azure Face API key is not configured");

        _sessionClient = new FaceSessionClient(new Uri(_endpoint), new AzureKeyCredential(_apiKey));

        _httpClient = new HttpClient();
    }

    public async Task<AppLivenessResult> CreateLivenessWithVerifySessionAsync(
        Stream referenceImage, string contentType, Guid deviceCorrelationId, CancellationToken cancellationToken)
    {
        var sessionContent = new CreateLivenessWithVerifySessionContent(LivenessOperationMode.Passive)
        {
            DeviceCorrelationId = deviceCorrelationId.ToString(),
        };

        var response = await _sessionClient.CreateLivenessWithVerifySessionAsync(
            sessionContent, referenceImage, cancellationToken);

        return new AppLivenessResult
        {
            SessionId = response.Value.SessionId,
            AuthToken = response.Value.AuthToken,
        };
    }

    public async Task<AppVerificationResult> GetLivenessWithVerifyResultAsync(
        string sessionId, CancellationToken cancellationToken)
    {
        var endpoint =
            _endpoint.TrimEnd('/');

        var url =
            $"{endpoint}/face/v1.2/" +
            $"detectLivenessWithVerify-sessions/{sessionId}";

        using var request =
            new HttpRequestMessage(
                HttpMethod.Get,
                url);

        request.Headers.Add(
            "Ocp-Apim-Subscription-Key",
            _apiKey);

        using var response =
            await _httpClient.SendAsync(
                request,
                cancellationToken);

        var json =
            await response.Content.ReadAsStringAsync(
                cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Azure Face result request failed " +
                $"with status {(int)response.StatusCode}.");
        }

        using var document =
            JsonDocument.Parse(json);

        var root = document.RootElement;

        var status =
            root.TryGetProperty("status", out var statusElement)
                ? statusElement.ToString()
                : "Unknown";

        if (
            !root.TryGetProperty("results", out var results) ||
            !results.TryGetProperty("attempts", out var attempts) ||
            attempts.ValueKind != JsonValueKind.Array ||
            attempts.GetArrayLength() == 0)
        {
            return new AppVerificationResult
            {
                Status = status,
                IsComplete = false,
            };
        }

        var latestAttempt =
            attempts[attempts.GetArrayLength() - 1];

        var attemptStatus =
            latestAttempt.TryGetProperty(
                "attemptStatus",
                out var attemptStatusElement)
                ? attemptStatusElement.ToString()
                : string.Empty;

        if (!string.Equals(
               attemptStatus,
               "Succeeded",
               StringComparison.OrdinalIgnoreCase))
        {
            return new AppVerificationResult
            {
                Status = attemptStatus.Length > 0
                    ? attemptStatus
                    : status,
                IsComplete = false,
            };
        }

        bool? livenessPassed = null;
        bool? faceMatched = null;
        double? matchConfidence = null;

        if (
            latestAttempt.TryGetProperty(
                "result",
                out var resultElement) &&
            resultElement.ValueKind ==
                JsonValueKind.Object)
        {
            if (
                resultElement.TryGetProperty(
                    "livenessDecision",
                    out var decisionElement))
            {
                var decision = decisionElement.ToString();

                livenessPassed =
                    string.Equals(
                        decision,
                        "realface",
                        StringComparison.OrdinalIgnoreCase);
            }

            if (
                resultElement.TryGetProperty(
                    "verifyResult",
                    out var verifyResult) &&
                verifyResult.ValueKind == JsonValueKind.Object)
            {
                if (
                    verifyResult.TryGetProperty(
                        "isIdentical",
                        out var identicalElement))
                {
                    faceMatched =
                        identicalElement.ValueKind switch
                        {
                            JsonValueKind.True => true,
                            JsonValueKind.False => false,
                            _ => null,
                        };
                }

                if (
                    verifyResult.TryGetProperty(
                        "matchConfidence",
                        out var confidenceElement) &&
                    confidenceElement.TryGetDouble(
                        out var confidence))
                {
                    matchConfidence = confidence;
                }
            }
        }

        return new AppVerificationResult
        {
            Status = attemptStatus,
            LivenessPassed = livenessPassed,
            FaceMatched = faceMatched,
            MatchConfidence = matchConfidence,
            IsComplete = true,
        };
    }
}
