using Application.Features.Onboarding.Dtos;
using Application.Features.Onboarding.Exceptions;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;
using Infrastructure.Data;
using Infrastructure.Repositories;
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
            new OnboardingRepository(context),
            new MockGovernmentRegistryRepository()
        );
    }

    [Fact]
    public async Task OnboardCitizen_WithValidRequest_CreatesPendingCitizen()
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

        var result = await service.OnboardCitizenAsync(request);

        var citizen = await context.Citizens.FirstOrDefaultAsync(c => c.SaId == request.SaId, TestContext.Current.CancellationToken);
        var user = await context.DomainUsers.FirstOrDefaultAsync(u => u.Email == request.Email, TestContext.Current.CancellationToken);

        Assert.NotNull(citizen);
        Assert.NotNull(user);
        Assert.Equal(request.SaId, result.SaId);
        Assert.Equal("Pending", result.Status);
        Assert.False(citizen!.IsActivated);
        Assert.False(string.IsNullOrWhiteSpace(citizen.ActivationCode));
        Assert.NotEqual(Guid.Empty, citizen.UserId);
    }

    [Fact]
    public async Task OnboardCitizen_WithoutConsent_ThrowsCitizenConsentRequiredException()
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

        await Assert.ThrowsAsync<CitizenConsentRequiredException>(() =>
            service.OnboardCitizenAsync(request));
    }

    [Fact]
    public async Task OnboardCitizen_WithUnknownSaId_ThrowsIdentityRecordNotFoundException()
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

        await Assert.ThrowsAsync<IdentityRecordNotFoundException>(() =>
            service.OnboardCitizenAsync(request));
    }

    [Fact]
    public async Task OnboardCitizen_WithDuplicateSaId_ThrowsException()
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

        await service.OnboardCitizenAsync(request);

        await Assert.ThrowsAsync<DuplicateIdRegisteredException>(() =>
            service.OnboardCitizenAsync(request));
    }

    [Fact]
    public void MockGovernmentRegistry_WithKnownSaId_ReturnsIdentityRecord()
    {
        var registryService = new MockGovernmentRegistryRepository();

        var record = registryService.GetBySaId("0000001971025");

        Assert.NotNull(record);
        Assert.Equal("0000001971025", record!.SaId);
        Assert.Equal("Tiana", record.Names);
        Assert.Equal("Rogers", record.Surname);
    }
}