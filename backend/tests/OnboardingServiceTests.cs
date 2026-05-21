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
    
}