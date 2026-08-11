using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Common.Validation;
using Application.Features.Institutions.DTOs;
using Application.Features.Institutions.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class InstitutionService : IInstitutionService
{
    private readonly IInstitutionRepository _institutionRepository;
    private readonly InstitutionMapper _mapper;
    private readonly IEmailSenderProvider _emailSenderProvider;

    public InstitutionService(IInstitutionRepository institutionRepository, InstitutionMapper mapper, IEmailSenderProvider emailSenderProvider)
    {
        _institutionRepository = institutionRepository;
        _mapper = mapper;
        _emailSenderProvider = emailSenderProvider;
    }

    public async Task<RegisterInstitutionResponseDto> RegisterInstitutionAsync(
        RegisterInstitutionRequestDto request)
    {
        InstitutionValidator.Validate(request);

        var admin = await _institutionRepository.GetAdminByIdAsync(request.AdminId);
        if (admin == null)
            throw new AdminNotFoundException(request.AdminId);

        if (await _institutionRepository.InstitutionExistsByVerificationNumberAsync(
                request.VerificationNumber))
            throw new InstitutionAlreadyExistsException(request.VerificationNumber);

        var apiKey = GenerateApiKey();
        var apiKeyReference = Guid.NewGuid();

        var institution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Type = request.Type,
            VerificationNumber = request.VerificationNumber,
            ContactEmail = request.ContactEmail,
            ApiKeyReference = apiKeyReference,
            ApiKeyHash = HashApiKey(apiKey),
            ApiKeyGeneratedAt = DateTime.UtcNow,
            RegisteredById = request.AdminId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.InstitutionRegistered,
            Details = $"Institution '{request.Name}' registered by admin '{request.AdminId}'.",
            IpAddress = "system",
            ActorId = admin.UserId,
            CreatedAt = DateTime.UtcNow,
        };

        await _institutionRepository.AddInstitutionAsync(institution);
        await _institutionRepository.AddAuditLogAsync(auditLog);
        await _institutionRepository.SaveChangesAsync();

        var dto = _mapper.InstitutionToRegisterResponseDto(institution);
        dto.ApiKey = apiKey;
        dto.ApiKeyReference = apiKeyReference;

        var message = $"""
        <div style="background-color:#f7f4ea; padding:32px 16px; font-family:Arial, Helvetica, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; margin:0 auto; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
                <tr>
                    <td style="padding:0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="background-color:#007a4d; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#ffb81c; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#de3831; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#002395; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px 32px 0 32px;">
                        <span style="font-size:20px; font-weight:700; color:#053b2c; letter-spacing:0.5px;">FlashID</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 32px 0 32px; color:#111827; font-size:15px; line-height:1.6;">
                        Hi there,
                        <br /><br />
                        Your institution has been registered on FlashID. Use the API key below to authenticate your integration.
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 32px 0 32px;">
                        <div style="background-color:#f7f4ea; border:1px solid #ffb81c; border-radius:12px; padding:20px; text-align:center; word-break:break-all;">
                            <span style="font-size:16px; font-weight:700; letter-spacing:1px; color:#053b2c;">{apiKey}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 32px 0 32px; color:#6b7280; font-size:13px; line-height:1.6;">
                        This key will not be shown again. Store it securely.
                        <br /><br />
                        If you did not expect this email, please contact the FlashID team immediately.
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 32px 28px 32px; color:#111827; font-size:14px; line-height:1.6;">
                        Stay secure,<br />
                        The FlashID Team
                    </td>
                </tr>
                <tr>
                    <td style="padding:0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="background-color:#002395; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#de3831; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#ffb81c; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#007a4d; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <p style="text-align:center; color:#9ca3af; font-size:12px; margin-top:16px;">
                &copy; {DateTime.UtcNow.Year} FlashId | South African Digital ID Wallet. All rights reserved.
            </p>
        </div>
        """;
        await _emailSenderProvider.SendEmailAsync(request.ContactEmail, "Your FlashID Institution API Key", message);

        return dto;
    }

    public async Task<IEnumerable<GetInstitutionResponseDto>> GetAllInstitutionsAsync()
    {
        var institutions = await _institutionRepository.GetAllInstitutionsAsync();
        return institutions.Select(_mapper.InstitutionToGetResponseDto);
    }

    public async Task<GetInstitutionResponseDto> GetInstitutionByIdAsync(Guid institutionId)
    {
        var institution = await _institutionRepository.GetInstitutionByIdAsync(institutionId);

        if (institution == null)
            throw new InvalidInstitutionRequestException(
                $"Institution with ID '{institutionId}' was not found.");

        return _mapper.InstitutionToGetResponseDto(institution);
    }

    public async Task<RegenerateApiKeyResponseDto> RegenerateApiKeyAsync(Guid institutionId, Guid? adminId)
    {
        var institution = await _institutionRepository.GetInstitutionByIdAsync(institutionId);

        if (institution == null)
            throw new InvalidInstitutionRequestException(
                $"Institution with ID '{institutionId}' was not found.");

        var newApiKey = GenerateApiKey();
        institution.ApiKeyHash = HashApiKey(newApiKey);
        institution.ApiKeyReference = Guid.NewGuid();
        institution.ApiKeyGeneratedAt = DateTime.UtcNow;
        institution.UpdatedAt = DateTime.UtcNow;

        var details = adminId.HasValue
            ? $"API key regenerated for institution '{institution.Name}' by admin '{adminId}'."
            : $"API key automatically regenerated for institution '{institution.Name}' (30-day rotation policy).";

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.InstitutionApiKeyRegenerated,
            Details = details,
            IpAddress = "system",
            ActorId = adminId,
            CreatedAt = DateTime.UtcNow,
        };

        await _institutionRepository.AddAuditLogAsync(auditLog);
        await _institutionRepository.SaveChangesAsync();

        var message = $"""
        <div style="background-color:#f7f4ea; padding:32px 16px; font-family:Arial, Helvetica, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; margin:0 auto; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
                <tr>
                    <td style="padding:0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="background-color:#007a4d; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#ffb81c; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#de3831; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#002395; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px 32px 0 32px;">
                        <span style="font-size:20px; font-weight:700; color:#053b2c; letter-spacing:0.5px;">FlashID</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 32px 0 32px; color:#111827; font-size:15px; line-height:1.6;">
                        Hi there,
                        <br /><br />
                        Your institution's API key has been regenerated. The previous key is no longer valid.
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 32px 0 32px;">
                        <div style="background-color:#f7f4ea; border:1px solid #ffb81c; border-radius:12px; padding:20px; text-align:center; word-break:break-all;">
                            <span style="font-size:16px; font-weight:700; letter-spacing:1px; color:#053b2c;">{newApiKey}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 32px 0 32px; color:#6b7280; font-size:13px; line-height:1.6;">
                        This key will not be shown again. Store it securely.
                        <br /><br />
                        If you did not request this regeneration, please contact the FlashID team immediately.
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 32px 28px 32px; color:#111827; font-size:14px; line-height:1.6;">
                        Stay secure,<br />
                        The FlashID Team
                    </td>
                </tr>
                <tr>
                    <td style="padding:0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="background-color:#002395; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#de3831; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#ffb81c; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#007a4d; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <p style="text-align:center; color:#9ca3af; font-size:12px; margin-top:16px;">
                &copy; {DateTime.UtcNow.Year} FlashId | South African Digital ID Wallet. All rights reserved.
            </p>
        </div>
        """;
        await _emailSenderProvider.SendEmailAsync(institution.ContactEmail, "Your FlashID Institution API Key Was Regenerated", message);

        return new RegenerateApiKeyResponseDto
        {
            InstitutionId = institution.Id,
            ApiKey = newApiKey,
            RegeneratedAt = DateTime.UtcNow,
        };
    }

    private static string GenerateApiKey()
    {
        var bytes = new byte[16];
        System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
        return $"flashid_live_{Convert.ToHexString(bytes).ToLower()}";
    }

    private static string HashApiKey(string apiKey)
    {
        var bytes = System.Security.Cryptography.SHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes(apiKey));
        return Convert.ToHexString(bytes).ToLower();
    }
}