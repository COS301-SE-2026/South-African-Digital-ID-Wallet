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

        var cleanSaId = string.IsNullOrWhiteSpace(saId)
            ? null
            : saId.Trim();

        if (cleanSaId is null)
            throw new ArgumentException("Invalid South African ID Number.");

        if (!Regex.IsMatch(cleanSaId, @"^\d{13}$", RegexOptions.None, TimeSpan.FromMilliseconds(600)))
            throw new ArgumentException("Invalid South African ID number");

        var citizenRecord = await _governmentRegistryGateway.GetCitizenBySaIdAsync(cleanSaId);

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
            !Regex.IsMatch(phoneNumber, @"^(\+27)[6-8][0-9]{8}$", RegexOptions.None
            , TimeSpan.FromMilliseconds(600)))
            throw new InvalidSAPhoneNumberException();

        if (email is not null && !Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.None
                , TimeSpan.FromMilliseconds(600)))
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
        var message = BuildEmailMessage(activationLink, citizen.Names);

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

        var token = Uri.EscapeDataString(rawToken);

        return $"{baseUrl}/citizens/activate-credentials?token={token}";
    }

    private string BuildEmailMessage(string activationLink, string name)
    {
        return
            $$"""
             <div style="background-color:#f7f4ea; padding:32px 16px; font-family:Arial, Helvetica, sans-serif;">
             
                 <table role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        style="max-width:480px; margin:0 auto; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
                     <tr>
                         <td style="padding:0;">
                             <table role="presentation"
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0">
                                 <tr>
                                     <td style="background-color:#007a4d; width:25%; height:6px; font-size:0; line-height:0;">
                                         &nbsp;
                                     </td>
             
                                     <td style="background-color:#ffb81c; width:25%; height:6px; font-size:0; line-height:0;">
                                         &nbsp;
                                     </td>
             
                                     <td style="background-color:#de3831; width:25%; height:6px; font-size:0; line-height:0;">
                                         &nbsp;
                                     </td>
             
                                     <td style="background-color:#002395; width:25%; height:6px; font-size:0; line-height:0;">
                                         &nbsp;
                                     </td>
                                 </tr>
                             </table>
                         </td>
                     </tr>
             
                     
                     <tr>
                         <td style="padding:28px 32px 0 32px;">
                             <span style="font-size:22px; font-weight:700; color:#053b2c; letter-spacing:0.5px;">
                                 FlashID
                             </span>
             
                             <div style="margin-top:4px; color:#6b7280; font-size:12px; letter-spacing:0.4px;">
                                 Prove yourself in a flash.
                             </div>
                         </td>
                     </tr>
             
                     
                     <tr>
                         <td style="padding:24px 32px 0 32px; color:#111827; font-size:15px; line-height:1.6;">
                             Hi there {{name}},
                             <br /><br />
             
                             Welcome to <strong>FlashID</strong>. Your identity has been
                             successfully onboarded and your pending FlashID profile is ready.
             
                             <br /><br />
             
                             Use the button below to continue the activation process and securely
                             link your digital credentials.
                         </td>
                     </tr>
             
                     
                     <tr>
                         <td align="center" style="padding:28px 32px 28px 32px;">
                             <a href="{{activationLink}}"
                                target="_blank"
                                style="display:inline-block; background-color:#007a4d; color:#ffffff; text-decoration:none; font-size:15px; font-weight:700; padding:14px 32px; border-radius:10px;">
                                 Activate my FlashID
                             </a>
                         </td>
                     </tr>
             
                     
                     <tr>
                         <td style="padding:0 32px 24px 32px; color:#6b7280; font-size:13px; line-height:1.6;">
                             If the button does not work, copy and paste this link into your browser:
             
                             <br /><br />
             
                             <a href="{{activationLink}}"
                                style="color:#002395; text-decoration:underline; word-break:break-all;">
                                 {{activationLink}}
                             </a>
                         </td>
                     </tr>
             
                     
                     <tr>
                         <td style="padding:0 32px 24px 32px; color:#6b7280; font-size:13px; line-height:1.6;">
                             This activation link is valid for 48 hours.
             
                             <br /><br />
             
                             For your security, do not share or forward this activation link.
                             If you did not request a FlashID profile, you can safely ignore this email.
                         </td>
                     </tr>
             
                     
                     <tr>
                         <td style="padding:0 32px 28px 32px; color:#111827; font-size:14px; line-height:1.6;">
                             Stay secure,<br />
                             <strong>The FlashID Team</strong>
                         </td>
                     </tr>
             
                     
                     <tr>
                         <td style="padding:0;">
                             <table role="presentation"
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0">
                                 <tr>
                                     <td style="background-color:#002395; width:25%; height:6px; font-size:0; line-height:0;">
                                         &nbsp;
                                     </td>
             
                                     <td style="background-color:#de3831; width:25%; height:6px; font-size:0; line-height:0;">
                                         &nbsp;
                                     </td>
             
                                     <td style="background-color:#ffb81c; width:25%; height:6px; font-size:0; line-height:0;">
                                         &nbsp;
                                     </td>
             
                                     <td style="background-color:#007a4d; width:25%; height:6px; font-size:0; line-height:0;">
                                         &nbsp;
                                     </td>
                                 </tr>
                             </table>
                         </td>
                     </tr>
                 </table>
             
                 <p style="text-align:center; color:#9ca3af; font-size:12px; line-height:1.5; margin:16px auto 0 auto; max-width:480px;">
                     &copy; {{DateTime.UtcNow.Year}} FlashID |
                     South African Digital ID Wallet.<br />
                     All rights reserved.
                 </p>
             </div>
             """;
    }

}