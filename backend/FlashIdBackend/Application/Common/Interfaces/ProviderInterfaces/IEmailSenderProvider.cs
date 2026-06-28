namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IEmailSenderProvider
{
    Task SendAsync(string toEmail, string subject, string htmlBody);
}