using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;
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
        var cleanSaId = ValidateSaId(saId);
        var govRegistryResponse = await _httpClient.GetAsync($"api/citizens/{Uri.EscapeDataString(cleanSaId)}");

        if (govRegistryResponse.StatusCode == HttpStatusCode.NotFound)
            return null;

        govRegistryResponse.EnsureSuccessStatusCode();

        return await govRegistryResponse.Content.ReadFromJsonAsync<CitizenRecordDto>();
    }

    private static string ValidateSaId(string saId)
    {
        ArgumentException.ThrowIfNullOrEmpty(saId, nameof(saId));
        var clean = saId.Trim();
        if (!Regex.IsMatch(clean, @"^\d{13}$", RegexOptions.None, TimeSpan.FromMilliseconds(600)))
            throw new ArgumentException("Invalid South African ID number");
        return clean;
    }

}