using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Services;
using Application.Features.Credentials.DTOs;
using Application.Features.Onboarding.Dtos;
using Application.Features.Onboarding.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace tests;

public class OnboardingServiceTest
{
    private const string KnownSaId = "9001015800086";
    private const string TestIpAddress = "196.25.1.10";
    private const string FrontendBaseUrl = "https://flashid.test";
    private const string NormalizedEmail = "thabo.mokoena@example.com";

    private sealed class FakeGovernmentRegistryGateway : IGovernmentRegistryGateway
    {
        public CitizenRecordDto? CitizenToReturn { get; set; }
        public List<string> RequestedSaIds { get; } = new();

        public Task<CitizenRecordDto?> GetCitizenBySaIdAsync(string saId)
        {
            RequestedSaIds.Add(saId);
            return Task.FromResult(CitizenToReturn);
        }

        public Task<GovernmentRegistryIdentityDocumentDto?> GetIdentityDocumentBySaIdAsync(string saId, CancellationToken cancellationToken) => Task.FromResult<GovernmentRegistryIdentityDocumentDto?>(null);
        public Task<GovernmentRegistryDriversLicenseDto?> GetDriversLicenseBySaIdAsync(string saId, CancellationToken cancellationToken) => Task.FromResult<GovernmentRegistryDriversLicenseDto?>(null);
    }

    private sealed class FakeEmailSenderProvider : IEmailSenderProvider
    {
        public int SendCount { get; private set; }
        public string? LastToEmail { get; private set; }
        public string? LastSubject { get; private set; }
        public string? LastMessage { get; private set; }

        public Task SendEmailAsync(string toEmail, string subject, string message, CancellationToken ct = default)
        {
            SendCount++;
            LastToEmail = toEmail;
            LastSubject = subject;
            LastMessage = message;
            return Task.CompletedTask;
        }
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static IConfiguration CreateConfiguration(string? frontendBaseUrl = FrontendBaseUrl)
    {
        var values = new Dictionary<string, string?>();
        if (frontendBaseUrl is not null)
        {
            values["Activation:FrontendBaseUrl"] = frontendBaseUrl;
        }
        return new ConfigurationBuilder().AddInMemoryCollection(values).Build();
    }

    private static OnboardingService CreateService(AppDbContext context, FakeGovernmentRegistryGateway gateway, FakeEmailSenderProvider emailSender, IConfiguration? configuration = null)
    {
        return new OnboardingService(
            new OnboardingRepository(context),
            gateway,
            emailSender,
            configuration ?? CreateConfiguration()
        );
    }

    private static CitizenRecordDto KnownRecord() => new()
    {
        SaId = KnownSaId,
        Names = "Thabo",
        Surname = "Mokoena",
        DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        Gender = "Male",
    };

    private static OnboardCitizenRequest ValidRequest() => new()
    {
        SaId = KnownSaId,
        Email = " Thabo.Mokoena@Example.COM ",
        PhoneNumber = "082 123 4567",
        ConsentGiven = true,
    };

    [Fact]
    public async Task OnboardCitizen_WithValidRequest_CreatesPendingCitizen()
    {
        using var context = CreateContext();
        var gateway = new FakeGovernmentRegistryGateway { CitizenToReturn = KnownRecord() };
        var emailSender = new FakeEmailSenderProvider();
        var service = CreateService(context, gateway, emailSender);
        var officialId = Guid.NewGuid();
        var response = await service.OnboardCitizenAsync(ValidRequest(), officialId, TestIpAddress);

        Assert.Equal(KnownSaId, response.SaId);
        Assert.Equal("Pending", response.Status);
        Assert.NotEqual(Guid.Empty, response.CitizenId);
        Assert.Matches(@"^\d{6}$", response.ActivationPin);

        var citizen = Assert.Single(context.Citizens);
        Assert.Equal(response.CitizenId, citizen.Id);
        Assert.Equal(KnownSaId, citizen.SaId);
        Assert.Equal("Thabo", citizen.Names);
        Assert.Equal("Mokoena", citizen.Surname);
        Assert.Equal(Gender.Male, citizen.Gender);
        Assert.Equal(CitizenStatus.Pending, citizen.Status);

        var activation = Assert.Single(context.CitizenActivations);
        Assert.Equal(citizen.Id, activation.CitizenId);
        Assert.Equal(NormalizedEmail, activation.Email);
        Assert.Equal("+27821234567", activation.PhoneNumber);
        Assert.Equal(ActivationStatus.Pending, activation.Status);
        Assert.Equal(0, activation.AttemptCount);

        var expectedExpiry = DateTime.UtcNow.AddHours(48);
        Assert.True((activation.ExpiresAt - expectedExpiry).Duration() < TimeSpan.FromMinutes(1));
        Assert.Equal(activation.ExpiresAt, response.ActivationExpiresAt);

        Assert.NotEqual(response.ActivationPin, activation.PinHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(response.ActivationPin, activation.PinHash));
        Assert.Matches(@"^[0-9A-F]{64}$", activation.TokenHash);

        Assert.Equal(1, emailSender.SendCount);
        Assert.Equal(NormalizedEmail, emailSender.LastToEmail);
        Assert.Equal("FlashID", emailSender.LastSubject);
        Assert.Contains($"{FrontendBaseUrl}/activate?token=", emailSender.LastMessage!);
        Assert.DoesNotContain(activation.TokenHash, emailSender.LastMessage!);
    }

    [Fact]
    public async Task OnboardCitizen_WithoutConsent_ThrowsCitizenConsentRequiredException()
    {
        using var context = CreateContext();
        var gateway = new FakeGovernmentRegistryGateway { CitizenToReturn = KnownRecord() };
        var emailSender = new FakeEmailSenderProvider();
        var service = CreateService(context, gateway, emailSender);

        var request = ValidRequest();
        request.ConsentGiven = false;

        await Assert.ThrowsAsync<CitizenConsentRequiredException>(
            () => service.OnboardCitizenAsync(request, Guid.NewGuid(), TestIpAddress)
        );

        Assert.Empty(gateway.RequestedSaIds);
        Assert.Equal(0, emailSender.SendCount);
        Assert.Empty(context.Citizens);
    }

    [Fact]
    public async Task OnboardCitizen_WithUnknownSaId_ThrowsIdentityRecordNotFoundException()
    {
        using var context = CreateContext();
        var gateway = new FakeGovernmentRegistryGateway { CitizenToReturn = null };
        var emailSender = new FakeEmailSenderProvider();
        var service = CreateService(context, gateway, emailSender);

        await Assert.ThrowsAsync<IdentityRecordNotFoundException>(
            () => service.OnboardCitizenAsync(ValidRequest(), Guid.NewGuid(), TestIpAddress)
        );

        Assert.Equal(KnownSaId, Assert.Single(gateway.RequestedSaIds));
        Assert.Empty(context.Citizens);
        Assert.Equal(0, emailSender.SendCount);
    }

    [Fact]
    public async Task OnboardCitizen_WithDuplicateSaId_ThrowsException()
    {
        using var context = CreateContext();

        await context.Citizens.AddAsync(new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = KnownSaId,
            Names = "Thabo",
            Surname = "Mokoena",
            Status = CitizenStatus.Activated,
        }, TestContext.Current.CancellationToken);

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var gateway = new FakeGovernmentRegistryGateway { CitizenToReturn = KnownRecord() };
        var emailSender = new FakeEmailSenderProvider();
        var service = CreateService(context, gateway, emailSender);

        await Assert.ThrowsAsync<DuplicateIdRegisteredException>(
            () => service.OnboardCitizenAsync(ValidRequest(), Guid.NewGuid(), TestIpAddress)
        );

        Assert.Single(context.Citizens);
        Assert.Empty(context.CitizenActivations);
        Assert.Equal(0, emailSender.SendCount);
    }

    [Fact]
    public async Task OnboardCitizen_WithDuplicateEmail_ThrowsDuplicateEmailRegisteredException()
    {
        using var context = CreateContext();
        await context.DomainUsers.AddAsync(new User
        {
            Id = Guid.NewGuid(),
            Email = NormalizedEmail,
            Role = UserRole.Citizen,
        }, TestContext.Current.CancellationToken);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        var gateway = new FakeGovernmentRegistryGateway { CitizenToReturn = KnownRecord() };
        var emailSender = new FakeEmailSenderProvider();
        var service = CreateService(context, gateway, emailSender);
        await Assert.ThrowsAsync<DuplicateEmailRegisteredException>(
            () => service.OnboardCitizenAsync(ValidRequest(), Guid.NewGuid(), TestIpAddress)
        );
        Assert.Empty(context.Citizens);
        Assert.Equal(0, emailSender.SendCount);
    }

    [Fact]
    public async Task OnboardCitizen_WithMissingEmail_ThrowsArgumentException()
    {
        using var context = CreateContext();
        var gateway = new FakeGovernmentRegistryGateway { CitizenToReturn = KnownRecord() };
        var service = CreateService(context, gateway, new FakeEmailSenderProvider());
        var request = ValidRequest();
        request.Email = "   ";
        await Assert.ThrowsAsync<ArgumentException>(
            () => service.OnboardCitizenAsync(request, Guid.NewGuid(), TestIpAddress)
        );
        Assert.Empty(context.Citizens);
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("missing@domain")]
    [InlineData("spaced out@example.com")]
    public async Task OnboardCitizen_WithInvalidEmailFormat_ThrowsArgumentException(string email)
    {
        using var context = CreateContext();
        var gateway = new FakeGovernmentRegistryGateway { CitizenToReturn = KnownRecord() };
        var service = CreateService(context, gateway, new FakeEmailSenderProvider());
        var request = ValidRequest();
        request.Email = email;
        await Assert.ThrowsAsync<ArgumentException>(
            () => service.OnboardCitizenAsync(request, Guid.NewGuid(), TestIpAddress)
        );

        Assert.Empty(context.Citizens);
    }

    [Theory]
    [InlineData("012 345 6789")]
    [InlineData("082 123 456")]
    [InlineData("+44 7700 900123")]
    public async Task OnboardCitizen_WithInvalidPhoneNumber_ThrowsInvalidSAPhoneNumberException(string phone)
    {
        using var context = CreateContext();
        var gateway = new FakeGovernmentRegistryGateway { CitizenToReturn = KnownRecord() };
        var service = CreateService(context, gateway, new FakeEmailSenderProvider());

        var request = ValidRequest();
        request.PhoneNumber = phone;

        await Assert.ThrowsAsync<InvalidSAPhoneNumberException>(
            () => service.OnboardCitizenAsync(request, Guid.NewGuid(), TestIpAddress)
        );
        Assert.Empty(context.Citizens);
    }

    [Fact]
    public async Task OnboardCitizen_WithoutPhoneNumber_Succeeds()
    {
        using var context = CreateContext();
        var gateway = new FakeGovernmentRegistryGateway { CitizenToReturn = KnownRecord() };
        var emailSender = new FakeEmailSenderProvider();
        var service = CreateService(context, gateway, emailSender);

        var request = ValidRequest();
        request.PhoneNumber = string.Empty;

        var response = await service.OnboardCitizenAsync(request, Guid.NewGuid(), TestIpAddress);

        Assert.Equal("Pending", response.Status);
        Assert.Null(Assert.Single(context.CitizenActivations).PhoneNumber);
        Assert.Equal(1, emailSender.SendCount);
    }

    [Fact]
    public async Task VerifyCitizenIdentity_WithKnownSaId_ReturnsVerifiedRecord()
    {
        using var context = CreateContext();
        var gateway = new FakeGovernmentRegistryGateway { CitizenToReturn = KnownRecord() };
        var emailSender = new FakeEmailSenderProvider();
        var service = CreateService(context, gateway, emailSender);
        var result = await service.VerifyCitizenIdentityAsync($"  {KnownSaId}  ");
        Assert.Equal(KnownSaId, result.SaId);
        Assert.Equal("Thabo Mokoena", result.FullName);
        Assert.True(result.IsVerified);
        Assert.Equal(KnownSaId, Assert.Single(gateway.RequestedSaIds));
    }

    [Theory]
    [InlineData("")]
    [InlineData("123")]
    public async Task VerifyCitizenIdentity_WithMalformedSaId_ThrowsArgumentException(string saId)
    {
        using var context = CreateContext();
        var gateway = new FakeGovernmentRegistryGateway { CitizenToReturn = KnownRecord() };
        var emailSender = new FakeEmailSenderProvider();
        var service = CreateService(context, gateway, emailSender);
        await Assert.ThrowsAsync<ArgumentException>(() => service.VerifyCitizenIdentityAsync(saId));
        Assert.Empty(gateway.RequestedSaIds);
    }
}