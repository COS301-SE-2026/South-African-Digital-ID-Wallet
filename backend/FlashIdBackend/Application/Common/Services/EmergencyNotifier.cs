using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Common.Services;

public class EmergencyNotifier : IEmergencyNotifier
{
    private readonly IEmergencyRepository _repository;
    private readonly IEmailSenderProvider _email;
    private readonly INotificationRepository _notifications;
    private readonly ILogger<EmergencyNotifier> _logger;

    public EmergencyNotifier(
        IEmergencyRepository repository,
        IEmailSenderProvider email,
        INotificationRepository notifications,
        ILogger<EmergencyNotifier> logger)
    {
        _repository = repository;
        _email = email;
        _notifications = notifications;
        _logger = logger;
    }

    public async Task NotifyEmergencyAccessAsync(Guid accessId, CancellationToken ct)
    {
        var access = await _repository.GetAccessWithContactsAsync(accessId, ct);
        if (access is null) return;

        var citizen = access.EmergencyProfile.Citizen;

        var location = access.Latitude is null || access.Longitude is null
            ? string.Empty
            : $"\nLocation    Near {access.Latitude:F4}, {access.Longitude:F4}";

        var body = $"""
            A FlashID emergency responder opened {citizen.Names}'s emergency profile.

            Responder   {access.ResponderName}
            Institution {access.ResponderInstitutionName ?? "Not recorded"}
            Time        {access.AccessedAt:yyyy-MM-dd HH:mm} UTC{location}
            Reason      {access.Justification}

            If you believe this was not a genuine emergency, report it in the FlashID
            app under Activity, or call the FlashID support line.

            Ambulance 10177  |  All emergencies from a mobile 112
            """;

        const string subject = "FlashID emergency profile accessed";

        foreach (var contact in access.EmergencyProfile.Contacts
                     .Where(c => !string.IsNullOrWhiteSpace(c.Email))
                     .OrderBy(c => c.Priority))
        {
            try
            {
                await _email.SendEmailAsync(contact.Email!, subject, body, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Emergency access {AccessId}: the email to emergency contact {Priority} failed.",
                    accessId, contact.Priority);
            }
        }

        if (!string.IsNullOrWhiteSpace(citizen.User?.Email))
        {
            try
            {
                await _email.SendEmailAsync(
                    citizen.User.Email, "Your emergency profile was accessed", body, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Emergency access {AccessId}: the email to the citizen failed.", accessId);
            }
        }

        await _notifications.CreateNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Title = "Emergency profile accessed",
            Description = $"{access.ResponderName} opened your emergency profile "
                        + $"on {access.AccessedAt:yyyy-MM-dd HH:mm} UTC.",
            Tone = "warning",
            CreatedAt = DateTime.UtcNow,
            IsRead = false,
        });

        access.ContactNotifiedAt = DateTime.UtcNow;
        await _repository.SaveChangesAsync(ct);
    }
}
