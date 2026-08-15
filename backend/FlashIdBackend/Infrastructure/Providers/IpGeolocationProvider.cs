using System.Net.Http.Json;
using System.Text.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.ManageUserAccountCard.DTOs;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public class IpGeolocationProvider : IIpGeolocationProvider
{
    private readonly HttpClient _httpClient;
    private IConfiguration _configuration;

    public IpGeolocationProvider(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<IpLocationResult?> GetLocationAsync(string ipAddress, CancellationToken cancellationToken)
    {
        var apiKey = _configuration["IpGeolocation:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("IP Geolocation API key is missing");
        }
        var requestUrl = $"?apiKey={Uri.EscapeDataString(apiKey)}" + $"&ip={Uri.EscapeDataString(ipAddress)}";
        var response = await _httpClient.GetAsync(requestUrl, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var json = await response.Content.ReadFromJsonAsync<JsonDocument>(cancellationToken);
        if (json is null)
        {
            return null;
        }

        if (!json.RootElement.TryGetProperty("result", out var location))
        {
            return null;
        }

        location.TryGetProperty("city", out var cityElement);
        location.TryGetProperty("country_name", out var countryElement);

        return new IpLocationResult
        {
            City = cityElement.GetString(),
            Country = countryElement.GetString(),
        };

    }
}