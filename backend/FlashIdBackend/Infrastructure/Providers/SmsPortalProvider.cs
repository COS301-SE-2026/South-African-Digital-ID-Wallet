using System.Text;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Providers;

public class SmsPortalProvider : ISmsProvider
{
    private readonly HttpClient _client;
    private readonly IServiceProvider _serviceProvider;

    public SmsPortalProvider(HttpClient client, IServiceProvider serviceProvider)
    {
        _client = client;
        _serviceProvider = serviceProvider;
    }
    public async Task SendSmsAsync(string number, string message)
    {
        var configuration = _serviceProvider.GetRequiredService<IConfiguration>();
        var apiKey = configuration["SmsPortalProvider:ApiKey"];
        var apiSecret = configuration["SmsPortalProvider:ApiSecret"];

        var apiCredential = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{apiKey}:{apiSecret}"));

        var response = await _client.SendAsync(null);
    }
}