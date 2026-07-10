using Application.Features.Onboarding.Dtos;
using Domain.Entities;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IOnboardingService
{
    Task<VerifiedCitizenRecordResponse> VerifyCitizenIdentityAsync(string saId);
    Task<OnboardCitizenResponse> OnboardCitizenAsync(OnboardCitizenRequest request, Guid officialId, string ipAddress);
}