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

    public async Task<CitizenRecordDto> GetCitizenBySaIdAsync(string saId)
    {
        return await _httpClient.GetFromJsonAsync<CitizenRecordDto>(
            $"api/citizens/{saId}");
    }

}