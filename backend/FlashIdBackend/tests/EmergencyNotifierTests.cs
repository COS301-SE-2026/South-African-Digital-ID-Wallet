using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Services;
using Application.Features.Notifications.DTOs;
using Domain.Entities;

namespace tests;

public class EmergencyNotifierTests
{
    private sealed class FakeEmergencyRepository : IEmergencyRepository
    {
        public EmergencyAccess? AccessToReturn { get; set; }
        public int SaveCount { get; private set; }

        public Task<EmergencyAccess?> GetAccessWithContactsAsync(Guid id, CancellationToken ct) =>
            Task.FromResult(AccessToReturn);

        public Task SaveChangesAsync(CancellationToken ct)
        {
            SaveCount++;
            return Task.CompletedTask;
        }

        public Task<EmergencyDevice?> GetActiveDeviceByHandleAsync(byte[] h, CancellationToken ct) =>
            throw new NotImplementedException();
        public Task<EmergencyDevice?> GetActiveDeviceByCitizenIdAsync(Guid id, CancellationToken ct) =>
            throw new NotImplementedException();
        public Task<EmergencyProfile?> GetEnabledProfileWithContactsAsync(Guid id, CancellationToken ct) =>
            throw new NotImplementedException();
        public Task<EmergencyProfile?> GetProfileByUserIdAsync(Guid id, CancellationToken ct) =>
            throw new NotImplementedException();
        public Task<List<EmergencyAccess>> GetAccessHistoryByUserIdAsync(Guid id, CancellationToken ct) =>
            throw new NotImplementedException();
        public Task<Official?> GetResponderAsync(Guid id, CancellationToken ct) =>
            throw new NotImplementedException();
        public Task<bool> TryClaimCodeAsync(byte[] h, DateTimeOffset at, CancellationToken ct) =>
            throw new NotImplementedException();
        public Task AddDeviceAsync(EmergencyDevice d, CancellationToken ct) =>
            throw new NotImplementedException();
        public Task AddAccessAsync(EmergencyAccess a, CancellationToken ct) =>
            throw new NotImplementedException();
        public Task AddProfileAsync(EmergencyProfile p, CancellationToken ct) =>
            throw new NotImplementedException();
    }

    private sealed class FakeEmailSender : IEmailSenderProvider
    {
        public List<string> Recipients { get; } = new();
        public string? FailFor { get; set; }

        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default)
        {
            if (toEmail == FailFor)
                throw new InvalidOperationException("SMTP refused");
            Recipients.Add(toEmail);
            return Task.CompletedTask;
        }
    }

    private sealed class FakeNotificationRepository : INotificationRepository
    {
        public List<Notification> Created { get; } = new();

        public Task CreateNotificationAsync(Notification notification)
        {
            Created.Add(notification);
            return Task.CompletedTask;
        }

        public Task<Citizen?> GetCitizenByUserIdAsync(Guid userId) => throw new NotImplementedException();
        public Task<List<NotificationDto>> GetNotificationsByCitizenIdAsync(Guid id) =>
            throw new NotImplementedException();
    }

    private static EmergencyAccess BuildAccess(params EmergencyContact[] contacts)
    {
        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            Names = "Thandiwe",
            Surname = "Dlamini",
            User = new User { Id = Guid.NewGuid(), Email = "thandiwe@example.com" },
        };

        var profile = new EmergencyProfile
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Citizen = citizen,
            IsEnabled = true,
            Contacts = contacts.ToList(),
        };

        return new EmergencyAccess
        {
            Id = Guid.NewGuid(),
            EmergencyProfileId = profile.Id,
            EmergencyProfile = profile,
            ResponderName = "Dr Naledi Khumalo",
            ResponderInstitutionName = "Chris Hani Baragwanath",
            Justification = "Unconscious patient, ambulance callout",
            AccessedAt = DateTime.UtcNow,
        };
    }

    private static EmergencyContact Contact(string name, string? email, int priority) => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        Relationship = "Sibling",
        Email = email,
        Priority = priority,
    };

    [Fact]
    public async Task NotifyEmergencyAccessAsync_UnknownAccess_DoesNothing()
    {
        var repository = new FakeEmergencyRepository { AccessToReturn = null };
        var email = new FakeEmailSender();
        var notifications = new FakeNotificationRepository();
        var notifier = new EmergencyNotifier(repository, email, notifications);

        await notifier.NotifyEmergencyAccessAsync(Guid.NewGuid(), CancellationToken.None);

        Assert.Empty(email.Recipients);
        Assert.Empty(notifications.Created);
        Assert.Equal(0, repository.SaveCount);
    }

    [Fact]
    public async Task NotifyEmergencyAccessAsync_EmailsContactsInPriorityOrder()
    {
        var access = BuildAccess(
            Contact("Second", "second@example.com", 2),
            Contact("First", "first@example.com", 1));
        var repository = new FakeEmergencyRepository { AccessToReturn = access };
        var email = new FakeEmailSender();
        var notifier = new EmergencyNotifier(repository, email, new FakeNotificationRepository());

        await notifier.NotifyEmergencyAccessAsync(access.Id, CancellationToken.None);

        Assert.Equal("first@example.com", email.Recipients[0]);
        Assert.Equal("second@example.com", email.Recipients[1]);
    }

    [Fact]
    public async Task NotifyEmergencyAccessAsync_SkipsContactsWithoutEmail()
    {
        var access = BuildAccess(
            Contact("No email", null, 1),
            Contact("Blank", "   ", 2),
            Contact("Real", "real@example.com", 3));
        var repository = new FakeEmergencyRepository { AccessToReturn = access };
        var email = new FakeEmailSender();
        var notifier = new EmergencyNotifier(repository, email, new FakeNotificationRepository());

        await notifier.NotifyEmergencyAccessAsync(access.Id, CancellationToken.None);

        Assert.Equal(new[] { "real@example.com", "thandiwe@example.com" }, email.Recipients);
    }

    [Fact]
    public async Task NotifyEmergencyAccessAsync_OneBadAddress_StillNotifiesTheRest()
    {
        var access = BuildAccess(
            Contact("Broken", "broken@example.com", 1),
            Contact("Good", "good@example.com", 2));
        var repository = new FakeEmergencyRepository { AccessToReturn = access };
        var email = new FakeEmailSender { FailFor = "broken@example.com" };
        var notifications = new FakeNotificationRepository();
        var notifier = new EmergencyNotifier(repository, email, notifications);

        await notifier.NotifyEmergencyAccessAsync(access.Id, CancellationToken.None);

        Assert.Contains("good@example.com", email.Recipients);
        Assert.Single(notifications.Created);
    }

    [Fact]
    public async Task NotifyEmergencyAccessAsync_CreatesNotificationForTheCitizen()
    {
        var access = BuildAccess(Contact("Only", "only@example.com", 1));
        var repository = new FakeEmergencyRepository { AccessToReturn = access };
        var notifications = new FakeNotificationRepository();
        var notifier = new EmergencyNotifier(repository, new FakeEmailSender(), notifications);

        await notifier.NotifyEmergencyAccessAsync(access.Id, CancellationToken.None);

        var created = Assert.Single(notifications.Created);
        Assert.Equal(access.EmergencyProfile.Citizen.Id, created.CitizenId);
        Assert.Contains("Dr Naledi Khumalo", created.Description);
        Assert.False(created.IsRead);
    }

    [Fact]
    public async Task NotifyEmergencyAccessAsync_StampsContactNotifiedAtAndSaves()
    {
        var access = BuildAccess(Contact("Only", "only@example.com", 1));
        var repository = new FakeEmergencyRepository { AccessToReturn = access };
        var notifier = new EmergencyNotifier(repository, new FakeEmailSender(), new FakeNotificationRepository());

        await notifier.NotifyEmergencyAccessAsync(access.Id, CancellationToken.None);

        Assert.NotNull(access.ContactNotifiedAt);
        Assert.Equal(1, repository.SaveCount);
    }
}
