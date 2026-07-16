using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Providers;

public class SmsPortalProvider : ISmsProvider
{
    private readonly HttpClient _httpClient;

    public SmsPortalProvider(HttpClient client)
    {
        _httpClient = client;
    }
    public async Task SendSmsAsync(string number, string message)
    {
        var jsonSendRequest = $$"""
                                {
                                "messages": [
                                {
                                "content":"{{message}}",
                                "destination": "{{number}}",
                                }
                                ]
                                }
                                """;

        using var request = new HttpRequestMessage(HttpMethod.Post, "BulkMessages")
        {
            Content = new StringContent(
                jsonSendRequest,
                Encoding.UTF8,
                "application/json")
        };

        var response = await _httpClient.SendAsync(request);

        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"SMSPortal failed: {(int)response.StatusCode} {responseBody}");
        }

    }
}