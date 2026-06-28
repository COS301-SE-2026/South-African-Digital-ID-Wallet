using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public class ResendEmailSender : IEmailSenderProvider
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public ResendEmailSender(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        var apiKey = _config["Resend:ApiKey"] ??
                     throw new InvalidOperationException("Resend API key is not configured.");
        var fromAddress = _config["Resend:FromAddress"] ?? "onboarding@resend.dev";

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var response = await _httpClient.PostAsJsonAsync("https://api.resend.com/emails", new
        {
            from = fromAddress,
            to = new[] { toEmail },
            subject,
            html = htmlBody,
        });

        response.EnsureSuccessStatusCode();
    }
}