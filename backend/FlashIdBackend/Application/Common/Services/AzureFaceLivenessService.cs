using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Verification.Dtos;
using Microsoft.Extensions.Configuration;

namespace Application.Common.Services;

public class AzureFaceLivenessService : IFaceLivenessService
{
    private readonly HttpClient _httpClient;
    private readonly string _endpoint;
    private readonly string _apiKey;

    public AzureFaceLivenessService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _endpoint = configuration["AzureFace:Endpoint"] ?? throw new InvalidOperationException("Azure Face endpoint is not configured");
        _apiKey = configuration["AzureFace:ApiKey"] ?? throw new InvalidOperationException("Azure Face API key is not configured");
    }

    public async Task<CreateLivenessSessionResult> CreateLivenessWithVerifySessionAsync(Stream referenceImage, string contentType,
        Guid deviceCorrelationId, CancellationToken cancellationToken)
    {
        return new CreateLivenessSessionResult();
    }
}