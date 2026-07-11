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

    private static string NormalizeSaPhoneNumber(string phoneNumber)
    {
        var normalized = phoneNumber.Trim().Replace(" ", "").Replace("-", "");

        if (normalized.StartsWith("0"))
            normalized = $"+27{normalized[1..]}";

        return normalized;
    }

    public async Task<OnboardCitizenResponse> OnboardCitizenAsync(OnboardCitizenRequest request, Guid officialId, string ipAddress)
    {
        if (!request.ConsentGiven)
            throw new CitizenConsentRequiredException();

        var email = string.IsNullOrWhiteSpace(request.Email)
            ? null
            : request.Email.Trim().ToLowerInvariant();

        var phoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber)
            ? null
            : NormalizeSaPhoneNumber(request.PhoneNumber);

        var citizenRecord = await _governmentRegistryGateway.GetCitizenBySaIdAsync(request.SaId);

        if (citizenRecord is null)
            throw new IdentityRecordNotFoundException();

        if (email is null && phoneNumber is null)
            throw new ArgumentException("At least one contact method is required.");

        if (phoneNumber is not null &&
            !Regex.IsMatch(phoneNumber, @"^(\+27)[6-8][0-9]{8}$"))
            throw new InvalidSAPhoneNumberException();

        if (email is not null && !Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            throw new ArgumentException("Invalid email address format.", nameof(email));

        if (email is not null)
        {
            var existingUser = await _onboardingRepository.GetUserByEmailAsync(email);

            if (existingUser is not null)
                throw new DuplicateEmailRegisteredException();
        }

        var existingCitizen = await _onboardingRepository.GetCitizenBySaIdAsync(request.SaId);

        if (existingCitizen is not null)
            throw new DuplicateIdRegisteredException();


        var activationCode = Random.Shared.Next(100000, 999999).ToString();

        var now = DateTime.UtcNow;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PhoneNumber = phoneNumber,
            Role = UserRole.Citizen,
            IsEmailVerified = false,
            IsDeleted = false,
            CreatedAt = now,
            UpdatedAt = now,
        };

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = citizenRecord.SaId,
            Names = citizenRecord.Names,
            Surname = citizenRecord.Surname,
            UserId = user.Id,
            Status = CitizenStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now,
        };

        var activation = new CitizenActivation()
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            TokenHash = Random.Shared.Next(100000, 999999).ToString(),
            PinHash = Random.Shared.Next(100000, 999999).ToString(),
            ExpiresAt = now.AddMinutes(180),
            AttemptCount = 0,
            CreatedAt = now,
        };

        var consentAudit = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.ConsentRecorded,
            Details = $"POPIA Section 11 consent recorded during onboarding for citizen {citizenRecord.SaId}.",
            ActorId = officialId,
            IpAddress = ipAddress,
            CreatedAt = now
        };

        var onboardAudit = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.OnboardCitizen,
            Details = $"Citizen, {citizenRecord.SaId}, has been onboarded into FlashID system with pending account by Home Affairs Official, {officialId}.",
            ActorId = officialId,
            IpAddress = ipAddress,
            CreatedAt = now
        };

        await _onboardingRepository.AddAuditLogAsync(consentAudit);
        await _onboardingRepository.AddAuditLogAsync(onboardAudit);
        await _onboardingRepository.AddUserAsync(user);
        await _onboardingRepository.AddCitizenAsync(citizen);
        await _onboardingRepository.SaveChangesAsync();

        return new OnboardCitizenResponse
        {
            CitizenId = citizen.Id,
            SaId = citizenRecord.SaId,
            ActivationCode = activationCode,
            ActivationCodeExpiresAt = activation.ExpiresAt,
            Status = "Pending",
        };
    }

}