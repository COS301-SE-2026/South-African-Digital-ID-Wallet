using System.Text.RegularExpressions;
using Application.Features.Onboarding.Dtos;
using Application.Features.Onboarding.Exceptions;
using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class OnboardingService : IOnboardingService
{
    private readonly IOnboardingRepository _onboardingRepository;

    private readonly IGovernmentRegistryGateway _governmentRegistryGateway;
    public OnboardingService(IOnboardingRepository registryService, IGovernmentRegistryGateway governmentRegistryGateway)
    {
        _onboardingRepository = registryService;
        _governmentRegistryGateway = governmentRegistryGateway;
    }

    public async Task<VerifiedCitizenRecordResponse> VerifyCitizenIdentityAsync(string saId)
    {
        var citizenRecord = await _governmentRegistryGateway.GetCitizenBySaIdAsync(saId);

        if (citizenRecord is null)
            throw new IdentityRecordNotFoundException();

        return new VerifiedCitizenRecordResponse
        {
            SaId = citizenRecord.SaId,
            FullName = $"{citizenRecord.Names} {citizenRecord.Surname}",
            DateOfBirth = citizenRecord.DateOfBirth,
            IsVerified = true
        };
    }

    public async Task<OnboardCitizenResponse> OnboardCitizenAsync(OnboardCitizenRequest request)
    {
        if (!request.ConsentGiven)
            throw new CitizenConsentRequiredException();

        var citizenRecord = await _governmentRegistryGateway.GetCitizenBySaIdAsync(request.SaId);

        if (citizenRecord is null)
            throw new IdentityRecordNotFoundException();

        if (string.IsNullOrWhiteSpace(request.PhoneNumber) &&
            string.IsNullOrWhiteSpace(request.Email))
            throw new ArgumentException("At least one contact method is required.");

        if (!string.IsNullOrWhiteSpace(request.PhoneNumber) &&
            !Regex.IsMatch(request.PhoneNumber, @"^(\+27|0)[6-8][0-9]{8}$"))
            throw new InvalidSAPhoneNumberException();

        if (!string.IsNullOrWhiteSpace(request.Email) && !Regex.IsMatch(request.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            throw new ArgumentException("Invalid email address format.", nameof(request.Email));

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var existingUser = await _onboardingRepository.GetUserByEmailAsync(request.Email);

            if (existingUser is not null)
                throw new DuplicateEmailRegisteredException();
        }

        var existingCitizen = await _onboardingRepository.GetCitizenBySaIdAsync(request.SaId);

        if (existingCitizen is not null)
            throw new DuplicateIdRegisteredException();


        var activationCode = Random.Shared.Next(100000, 999999).ToString();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
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
            Names = citizenRecord.Names,
            Surname = citizenRecord.Surname,
            UserId = user.Id,
            Status = CitizenStatus.Pending,
            CredentialActivationCode = activationCode,
            CredentialActivationCodeExpiresAt = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _onboardingRepository.AddUserAsync(user);
        await _onboardingRepository.AddCitizenAsync(citizen);
        await _onboardingRepository.SaveChangesAsync();

        return new OnboardCitizenResponse
        {
            CitizenId = citizen.Id,
            SaId = citizenRecord.SaId,
            ActivationCode = activationCode,
            ActivationCodeExpiresAt = citizen.CredentialActivationCodeExpiresAt,
            Status = "Pending",
        };
    }

}