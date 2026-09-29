using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Application.Common.Interfaces.ProviderInterfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Providers;

public class EmailSenderProvider : IEmailSenderProvider
{
    private readonly IConfiguration _config;

    public EmailSenderProvider(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default)
    {
        var fromAddress = _config["Email:FromAddress"] ?? throw new InvalidOperationException("Email address not configured.");
        var appPassword = _config["Email:AppPassword"] ?? throw new InvalidOperationException("Email app password not configured.");

        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(fromAddress));
        email.To.Add(MailboxAddress.Parse(toEmail));
        email.Subject = subject;
        email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = message };

        using var smtp = new SmtpClient();
        smtp.CheckCertificateRevocation = !string.Equals(_config["Email:CheckCertificateRevocation"], "false", StringComparison.OrdinalIgnoreCase);
        await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls, ct);
        await smtp.AuthenticateAsync(fromAddress, appPassword, ct);
        await smtp.SendAsync(email, cancellationToken: ct);
        await smtp.DisconnectAsync(true, ct);
    }
}