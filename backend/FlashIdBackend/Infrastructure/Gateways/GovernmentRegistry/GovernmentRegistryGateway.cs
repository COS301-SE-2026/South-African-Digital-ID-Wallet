using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;
using Application.Common.Interfaces.GatewayInterfaces;
using Application.Features.Credentials.DTOs;
using Application.Features.Onboarding.Dtos;
using Application.Common.Validation;

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

        var govRegistryResponse = await _httpClient.GetAsync($"api/credentials/{Uri.EscapeDataString(cleanSaId)}/identity-document", cancellationToken);

        if (govRegistryResponse.StatusCode == HttpStatusCode.NotFound)
            return null;

        govRegistryResponse.EnsureSuccessStatusCode();

        return await govRegistryResponse.Content.ReadFromJsonAsync<GovernmentRegistryIdentityDocumentDto>(cancellationToken);
    }

    public async Task<GovernmentRegistryDriversLicenseDto?> GetDriversLicenseBySaIdAsync(string saId,
        CancellationToken cancellationToken)
    {
        var cleanSaId = ValidateSaId(saId);

        var govRegistryResponse = await _httpClient.GetAsync($"api/credentials/{Uri.EscapeDataString(cleanSaId)}/drivers-license", cancellationToken);

        if (govRegistryResponse.StatusCode == HttpStatusCode.NotFound)
            return null;

        govRegistryResponse.EnsureSuccessStatusCode();

        return await govRegistryResponse.Content.ReadFromJsonAsync<GovernmentRegistryDriversLicenseDto>(cancellationToken);
    }

    private static string ValidateSaId(string saId)
    {
        ArgumentException.ThrowIfNullOrEmpty(saId, nameof(saId));
        var clean = saId.Trim();
        if (!SaIdValidator.IsValid(clean))
            throw new ArgumentException("Invalid South African ID number");
        return clean;
    }

}