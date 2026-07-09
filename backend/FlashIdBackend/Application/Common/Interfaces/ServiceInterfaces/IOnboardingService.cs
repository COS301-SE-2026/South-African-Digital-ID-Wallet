using Application.Features.Onboarding.Dtos;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IOnboardingService
{
    Task<OnboardCitizenResponse> OnboardCitizenAsync(OnboardCitizenRequest request);
}