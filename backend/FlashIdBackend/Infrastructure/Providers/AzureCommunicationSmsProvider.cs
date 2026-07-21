using Application.Common.Interfaces.ProviderInterfaces;

namespace Infrastructure.Providers;

public class AzureCommunicationSmsProvider : ISmsProvider

{
    public async Task SendSmsAsync(string number, string message)
    {

    }
}