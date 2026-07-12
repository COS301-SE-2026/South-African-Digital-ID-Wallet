using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Application.Features.Onboarding.Dtos;
using Application.Features.Onboarding.Exceptions;
using Application.Common.Interfaces.GatewayInterfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace Application.Common.Services;

public class OnboardingService : IOnboardingService
{
    private readonly IOnboardingRepository _onboardingRepository;
    private readonly IGovernmentRegistryGateway _governmentRegistryGateway;
    private readonly IEmailSenderProvider _emailSenderProvider;
    private readonly IConfiguration _configuration;
    public OnboardingService(IOnboardingRepository registryService, IGovernmentRegistryGateway governmentRegistryGateway, IEmailSenderProvider emailSenderProvider, IConfiguration configuration)
    {
        _onboardingRepository = registryService;
        _governmentRegistryGateway = governmentRegistryGateway;
        _emailSenderProvider = emailSenderProvider;
        _configuration = configuration;
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

        if (email is null)
            throw new ArgumentException("Email is required.");

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

        var now = DateTime.UtcNow;

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = citizenRecord.SaId,
            Names = citizenRecord.Names,
            Surname = citizenRecord.Surname,
            DateOfBirth = citizenRecord.DateOfBirth,
            Gender = Enum.TryParse<Gender>(
                citizenRecord.Gender,
                ignoreCase: true,
                out var parsedGender)
                ? parsedGender
                : Gender.Unspecified,
            Status = CitizenStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now,
        };

        var rawToken = GenerateSecureToken();
        var rawPin = GenerateSecurePin();

        var activation = new CitizenActivation()
        {
            Id = Guid.NewGuid(),
            CitizenId = citizen.Id,
            Email = email,
            PhoneNumber = (phoneNumber is null) ? null : phoneNumber,
            TokenHash = HashToken(rawToken),
            PinHash = HashPin(rawPin),
            ExpiresAt = now.AddHours(48),
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
            CreatedAt = now,
        };

        var onboardAudit = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.OnboardCitizen,
            Details = $"Citizen, {citizenRecord.SaId}, has been onboarded into FlashID system with a pending account by Home Affairs Official, {officialId}.",
            ActorId = officialId,
            IpAddress = ipAddress,
            CreatedAt = now
        };

        await _onboardingRepository.AddAuditLogAsync(consentAudit);
        await _onboardingRepository.AddAuditLogAsync(onboardAudit);
        await _onboardingRepository.AddCitizenAsync(citizen);
        await _onboardingRepository.AddActivationAsync(activation);
        await _onboardingRepository.SaveChangesAsync();

        var activationLink = BuildActivationLink(rawToken);
        var message = $"Please find attached your activation link : {activationLink}";

        await _emailSenderProvider.SendEmailAsync(email, "FlashID", message);

        return new OnboardCitizenResponse
        {
            CitizenId = citizen.Id,
            SaId = citizenRecord.SaId,
            ActivationPin = rawPin,
            ActivationExpiresAt = activation.ExpiresAt,
            Status = "Pending",
        };
    }

    private static string GenerateSecureToken()
    {
        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToHexString(tokenBytes);
    }

    private static string GenerateSecurePin()
    {
        var pin = RandomNumberGenerator.GetInt32(0, 1_000_000);
        return pin.ToString("D6");
    }

    private static string HashToken(string rawToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(rawToken);
        var tokenBytes = Encoding.UTF8.GetBytes(rawToken);
        var hashBytes = SHA256.HashData(tokenBytes);
        return Convert.ToHexString(hashBytes);
    }

    private static string HashPin(string rawPin)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(rawPin);
        return BCrypt.Net.BCrypt.HashPassword(rawPin, workFactor: 12);
    }

    private string BuildActivationLink(string rawToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(rawToken);

        var frontendUrl = _configuration["Activation:FrontendBaseUrl"];

        if (string.IsNullOrWhiteSpace(frontendUrl))
        {
            throw new InvalidOperationException("Activation frontend URL is not configured.");
        }

        var baseUrl = frontendUrl.TrimEnd('/');

        var encodedToken = Uri.EscapeDataString(rawToken);

        return $"{baseUrl}/activate?encodedToken={encodedToken}";
    }

}