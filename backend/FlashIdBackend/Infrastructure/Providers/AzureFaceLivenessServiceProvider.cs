using System.Net.Http.Headers;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.Verification.Dtos;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public class AzureFaceLivenessServiceProvider : IFaceLivenessServiceProvider
{
    private readonly HttpClient _httpClient;
    private readonly string _endpoint;
    private readonly string _apiKey;

    public AzureFaceLivenessServiceProvider(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _endpoint = configuration["AzureFace:Endpoint"] ?? throw new InvalidOperationException("Azure Face endpoint is not configured");
        _apiKey = configuration["AzureFace:ApiKey"] ?? throw new InvalidOperationException("Azure Face API key is not configured");
    }

    public async Task<CreateLivenessSessionResult> CreateLivenessWithVerifySessionAsync(Stream referenceImage, string contentType,
        Guid deviceCorrelationId, CancellationToken cancellationToken)
    {
        using var form = new MultipartFormDataContent();

        form.Add(new StringContent("Passive"), "livenessOperationMode");
        form.Add(new StringContent(deviceCorrelationId.ToString()), "deviceCorrelationId");
        form.Add(new StringContent("false"), "enableSessionImage");

        using var imageContent = new StreamContent(referenceImage);
        imageContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        form.Add(imageContent, "verifyImage", "reference.jpg");

        using var request = new HttpRequestMessage(HttpMethod.Post, $"{_endpoint.TrimEnd('/')}/face/v1.2/detectLivenessWithVerify-sessions");

        request.Headers.Add("Ocp-Apim-Subscription-Key", _apiKey);

        request.Content = form;

        using var response = await _httpClient.SendAsync(request, cancellationToken);

        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Azure Face Session creation failed. Status :{(int)response.StatusCode}. Response:{responseBody}");
        }

        using var json = JsonDocument.Parse(responseBody);

        var root = json.RootElement;

        return new CreateLivenessSessionResult
        {
            SessionId = root.GetProperty("sessionId").GetString() ?? string.Empty,
            AuthToken = root.GetProperty("authToken").GetString() ?? string.Empty,
            Status = root.TryGetProperty("status", out var status) ? status.GetString() : null
        };
    }
}