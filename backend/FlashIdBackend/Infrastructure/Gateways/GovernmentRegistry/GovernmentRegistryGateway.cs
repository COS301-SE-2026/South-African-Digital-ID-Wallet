using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;
using Application.Common.Interfaces.GatewayInterfaces;
using Application.Features.Credentials.DTOs;
using Application.Features.Onboarding.Dtos;

namespace Infrastructure.Gateways.GovernmentRegistry;

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

    public async Task<GovernmentRegistryIdentityDocumentDto?> GetIdentityDocumentBySaIdAsync(string saId,
        CancellationToken cancellationToken)
    {
        var cleanSaId = ValidateSaId(saId);

        var govRegistryResponse = await _httpClient.GetAsync($"api/credentials/{Uri.EscapeDataString(cleanSaId)}/identity-document");

        if (govRegistryResponse.StatusCode == HttpStatusCode.NotFound)
            return null;

        govRegistryResponse.EnsureSuccessStatusCode();

        return await govRegistryResponse.Content.ReadFromJsonAsync<GovernmentRegistryIdentityDocumentDto>();
    }

    public async Task<GovernmentRegistryDriversLicenseDto?> GetDriversLicenseBySaIdAsync(string saId,
        CancellationToken cancellationToken)
    {
        var cleanSaId = ValidateSaId(saId);

        var govRegistryResponse = await _httpClient.GetAsync($"api/credentials/{Uri.EscapeDataString(cleanSaId)}/drivers-license");

        if (govRegistryResponse.StatusCode == HttpStatusCode.NotFound)
            return null;

        govRegistryResponse.EnsureSuccessStatusCode();

        return await govRegistryResponse.Content.ReadFromJsonAsync<GovernmentRegistryDriversLicenseDto>();
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