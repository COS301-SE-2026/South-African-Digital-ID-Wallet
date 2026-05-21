using Application.Features.Onboarding.Dtos;
using Application.Features.Onboarding.Exceptions;
using Application.Common.Interfaces;


namespace Infrastructure.Services;

public class OnboardingService : IOnboardingService
{
    private readonly MockGovernmentRegistryService _registryService;

    public OnboardingService(MockGovernmentRegistryService registryService)
    {
        _registryService = registryService;
    }

    public OnboardCitizenResponse OnboardCitizen(OnboardCitizenRequest request)
    {
        return new OnboardCitizenResponse();
    }

}