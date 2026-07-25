using Application.Features.Onboarding.Dtos;
using Application.Features.Onboarding.Exceptions;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Services;
using Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Gateways.GovernmentRegistry;
using Infrastructure.Providers;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

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

    private static OnboardingService CreateService(AppDbContext context, HttpClient client, IConfiguration configuration)
    {
        return new OnboardingService(
            new OnboardingRepository(context),
            new GovernmentRegistryGateway(client),
            new EmailSenderProvider(configuration),
            configuration
        );
    }

    [Fact]
    public async Task OnboardCitizen_WithValidRequest_CreatesPendingCitizen()
    {

    }

    [Fact]
    public async Task OnboardCitizen_WithoutConsent_ThrowsCitizenConsentRequiredException()
    {

    }

    [Fact]
    public async Task OnboardCitizen_WithUnknownSaId_ThrowsIdentityRecordNotFoundException()
    {

    }

    [Fact]
    public async Task OnboardCitizen_WithDuplicateSaId_ThrowsException()
    {

    }

    [Fact]
    public void MockGovernmentRegistry_WithKnownSaId_ReturnsIdentityRecord()
    {

    }
}