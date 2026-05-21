using Application.Features.Onboarding.Dtos;
using Application.Features.Onboarding.Exceptions;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class OnboardingServiceTest
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static OnboardingService CreateService(AppDbContext context)
    {
        return new OnboardingService(
            new MockGovernmentRegistryService(),
            context
        );
    }

    [Fact]
    public void OnboardCitizen_WithValidRequest_CreatesPendingCitizen()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var request = new OnboardCitizenRequest
        {
            SaId = "0000001971025",
            PhoneNumber = "0813456789",
            Email = "tiana@local.com",
            ConsentGiven = true
        };

        var result = service.OnboardCitizen(request);

        var citizen = context.Citizens.FirstOrDefault(c => c.SaId == request.SaId);
        var user = context.DomainUsers.FirstOrDefault(u => u.Email == request.Email);

        Assert.NotNull(citizen);
        Assert.NotNull(user);
        Assert.Equal(request.SaId, result.SaId);
        Assert.Equal("Pending", result.Status);
        Assert.False(citizen!.IsActivated);
        Assert.False(string.IsNullOrWhiteSpace(citizen.ActivationCode));
        Assert.NotEqual(Guid.Empty, citizen.UserId);
    }

    [Fact]
    public void OnboardCitizen_WithoutConsent_ThrowsCitizenConsentRequiredException()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var request = new OnboardCitizenRequest
        {
            SaId = "0000001971025",
            PhoneNumber = "0813456789",
            Email = "tiana@local.com",
            ConsentGiven = false
        };

        Assert.Throws<CitizenConsentRequiredException>(() =>
            service.OnboardCitizen(request));
    }

    [Fact]
    public void OnboardCitizen_WithUnknownSaId_ThrowsIdentityRecordNotFoundException()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var request = new OnboardCitizenRequest
        {
            SaId = "9999999999999",
            PhoneNumber = "0813456789",
            Email = "ghost@local.com",
            ConsentGiven = true
        };

        Assert.Throws<IdentityRecordNotFoundException>(() =>
            service.OnboardCitizen(request));
    }

    [Fact]
    public void OnboardCitizen_WithDuplicateSaId_ThrowsException()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var request = new OnboardCitizenRequest
        {
            SaId = "0000001971025",
            PhoneNumber = "0813456789",
            Email = "tiana@local.com",
            ConsentGiven = true
        };

        service.OnboardCitizen(request);

        Assert.Throws<Exception>(() =>
            service.OnboardCitizen(request));
    }

}