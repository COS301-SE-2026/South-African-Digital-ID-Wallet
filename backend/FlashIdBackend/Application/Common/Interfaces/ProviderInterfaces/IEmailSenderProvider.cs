namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IEmailSenderProvider
{
    Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default);
}