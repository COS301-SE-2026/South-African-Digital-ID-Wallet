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
        if (!request.ConsentGiven)
        {
            throw new CitizenConsentRequiredException();
        }

        var identityRecord = _registryService.GetBySaId(request.SaId);

        if (identityRecord is null)
        {
            throw new IdentityRecordNotFoundException();
        }

        var activationCode = Random.Shared.Next(100000, 999999).ToString();

        return new OnboardCitizenResponse
        {
            CitizenId = Guid.NewGuid(),
            SaId = identityRecord.SaId,
            ActivationCode = activationCode,
            ActivationCodeExpiresAt = DateTime.UtcNow.AddMinutes(15),
            Status = "Pending"
        };
    }

}