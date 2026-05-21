using Application.Features.Onboarding.Dtos;
using Application.Features.Onboarding.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;

namespace Infrastructure.Services;

public class OnboardingService : IOnboardingService
{
    private readonly MockGovernmentRegistryService _registryService;
    private readonly AppDbContext _context;
    public OnboardingService(MockGovernmentRegistryService registryService, AppDbContext context)
    {
        _registryService = registryService;
        _context = context;
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

        var existingCitizen = _context.Citizens
            .FirstOrDefault(citizen => citizen.SaId == request.SaId);

        if (existingCitizen is not null)
        {
            throw new Exception("Citizen already exists in FlashID.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Names = identityRecord.Names,
            Surname = identityRecord.Surname,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Username = request.Email,
            Role = UserRole.Citizen,
            IsEmailVerified = false,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

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