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

        var message = $"Your FlashID institution API key has been generated: {apiKey}. " +
            "Keep this key secure - it will not be shown again.";
        await _emailSenderProvider.SendEmailAsync(request.ContactEmail, "FlashID API Key", message);

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

    public async Task<RegenerateApiKeyResponseDto> RegenerateApiKeyAsync(Guid institutionId, Guid adminId)
    {
        var institution = await _institutionRepository.GetInstitutionByIdAsync(institutionId);

        if (institution == null)
            throw new InvalidInstitutionRequestException(
                $"Institution with ID '{institutionId}' was not found.");

        var newApiKey = GenerateApiKey();
        institution.ApiKeyHash = HashApiKey(newApiKey);
        institution.ApiKeyReference = Guid.NewGuid();
        institution.UpdatedAt = DateTime.UtcNow;

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.InstitutionApiKeyRegenerated,
            Details = $"API key regenerated for institution '{institution.Name}' by admin '{adminId}'.",
            IpAddress = "system",
            ActorId = adminId,
            CreatedAt = DateTime.UtcNow,
        };

        await _institutionRepository.AddAuditLogAsync(auditLog);
        await _institutionRepository.SaveChangesAsync();

        var message = $"Your FlashID institution API key has been regenerated: {newApiKey}. " +
            "The previous key is no longer valid. Keep this key secure - it will not be shown again.";
        await _emailSenderProvider.SendEmailAsync(institution.ContactEmail, "FlashID API Key Regenerated", message);

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