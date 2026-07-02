using Application.Features.Onboarding.Dtos;
using Application.Features.Onboarding.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class OnboardingService : IOnboardingService
{
    private readonly IOnboardingRepository _onboardingRepository;
    // private readonly IMockGovernmentRegistryRepository _mockGovernmentRegistryRepository;
    private readonly IGovernmentRegistryGateway _governmentRegistryGateway;
    public OnboardingService(IOnboardingRepository registryService, IMockGovernmentRegistryRepository mockGovernmentRegistryRepository, IGovernmentRegistryGateway governmentRegistryGateway)
    {
        _onboardingRepository = registryService;
        // _mockGovernmentRegistryRepository = mockGovernmentRegistryRepository;
        _governmentRegistryGateway = governmentRegistryGateway;
    }

    public async Task<OnboardCitizenResponse> OnboardCitizenAsync(OnboardCitizenRequest request)
    {
        if (!request.ConsentGiven)
            throw new CitizenConsentRequiredException();

        //Check if the user already exists... business logic
        var citizenRecord = await _governmentRegistryGateway.GetCitizenBySaIdAsync(request.SaId);

        if (citizenRecord is null)
            throw new IdentityRecordNotFoundException();

        var existingCitizen = await _onboardingRepository.GetCitizenBySaIdAsync(request.SaId);
        if (existingCitizen is not null)
            throw new DuplicateIdRegisteredException();

        // The activation code is a 6-digit number sent to the citizen out-of-band.
        // In production this would be sent via SMS or email, not returned in the response.
        var activationCode = Random.Shared.Next(100000, 999999).ToString();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Names = citizenRecord.Names,
            Surname = citizenRecord.Surname,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Username = request.Email,
            Role = UserRole.Citizen,
            IsEmailVerified = false,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = citizenRecord.SaId,
            UserId = user.Id,
            IsActivated = false,
            ActivationCode = activationCode,
            ActivationCodeExpiresAt = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        // Repository handles all persistence — the service never touches AppDbContext directly.
        //Edit once Nathan merges DB changes so that 
        //await _onboardingRepository.AddUserAsync(user);
        await _onboardingRepository.AddCitizenAsync(citizen);
        await _onboardingRepository.SaveChangesAsync();

        return new OnboardCitizenResponse
        {
            CitizenId = citizen.Id,
            SaId = citizenRecord.SaId,
            ActivationCode = activationCode,
            ActivationCodeExpiresAt = citizen.ActivationCodeExpiresAt,
            Status = "Pending",
        };
    }

}