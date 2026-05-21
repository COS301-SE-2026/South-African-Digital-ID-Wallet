using Application.Features.Onboarding.Dtos;

namespace Application.Common.Interfaces;

public interface IOnboardingService
{
    OnboardCitizenResponse OnboardCitizen(OnboardCitizenRequest request);
}