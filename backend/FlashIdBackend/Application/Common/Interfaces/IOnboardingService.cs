using Application.Features.Onboarding.Dtos;

namespace Application.Common.Interfaces;

public interface IOnboardingService
{
    Task<OnboardCitizenResponse> OnboardCitizenAsync(OnboardCitizenRequest request);
}