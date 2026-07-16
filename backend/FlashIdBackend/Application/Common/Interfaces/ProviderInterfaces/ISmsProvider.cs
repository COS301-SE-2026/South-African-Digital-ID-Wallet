namespace Application.Common.Interfaces.ProviderInterfaces;

public interface ISmsProvider
{
    Task SendSmsAsync(string number, string message);
}