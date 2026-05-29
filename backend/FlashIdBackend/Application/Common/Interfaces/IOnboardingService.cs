using Application.Features.Onboarding.DTOs;

namespace Application.Common.Interfaces;

public interface IOnboardingService
{
    Task<OnboardCitizenResponse> OnboardCitizenAsync(OnboardCitizenRequest request);
}