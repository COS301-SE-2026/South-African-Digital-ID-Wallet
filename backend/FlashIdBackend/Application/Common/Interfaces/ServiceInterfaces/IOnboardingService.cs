using Application.Features.Onboarding.Dtos;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IOnboardingService
{
    Task<VerifiedCitizenRecordResponse> VerifyCitizenIdentityAsync(string saId);
    Task<OnboardCitizenResponse> OnboardCitizenAsync(OnboardCitizenRequest request);
}