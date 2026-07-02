using System.Net;
using System.Net.Http.Json;
using Application.Common.Interfaces.GatewayInterfaces;
using Application.Features.Onboarding.Dtos;

namespace Infrastructure.Services.GovernmentRegistry;

public class GovernmentRegistryGateway : IGovernmentRegistryGateway
{
    private readonly HttpClient _httpClient;

    public GovernmentRegistryGateway(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<CitizenRecordDto?> GetCitizenBySaIdAsync(string saId)
    {
        var cleanSaId = saId.Trim();
        var govRegistryResponse = await _httpClient.GetAsync($"api/citizens/{cleanSaId}");

        if (govRegistryResponse.StatusCode == HttpStatusCode.NotFound)
            return null;

        govRegistryResponse.EnsureSuccessStatusCode();

        return await govRegistryResponse.Content.ReadFromJsonAsync<CitizenRecordDto>();
    }

}