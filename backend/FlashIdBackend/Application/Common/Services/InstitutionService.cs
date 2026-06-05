using Application.Common.Interfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Common.Validation;
using Application.Features.Institutions.DTOs;
using Application.Features.Institutions.Exceptions;
using Domain.Entities;
using Domain.Enums;
// using Infrastructure.Data;
// using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

// InstitutionService manages institution registration and querying.
// Only a GovernmentAdministrator may register institutions — the [Authorize] attribute
// on the controller enforces this at the HTTP level, but the service also verifies
// that the supplied AdminId exists in the database (defense in depth).
public class InstitutionService : IInstitutionService
{
    private readonly IInstitutionRepository _institutionRepository;
    private readonly InstitutionMapper _mapper;

    public InstitutionService(IInstitutionRepository institutionRepository, InstitutionMapper mapper)
    {
        _institutionRepository = institutionRepository;
        _mapper = mapper;
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

        // Generate a secure random API key.  The raw key is returned once to the caller
        // and never stored.  Only the ApiKeyReference (a GUID) is persisted, so the DB
        // cannot be used to recover the key if compromised.
        var apiKey = GenerateApiKey();
        var apiKeyReference = Guid.NewGuid();

        var institution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Type = request.Type,
            VerificationNumber = request.VerificationNumber,
            ApiKeyReference = apiKeyReference,
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

        // Mapperly maps the entity fields; we set ApiKey manually because it is
        // generated above and is not a property on the Institution entity.
        var dto = _mapper.InstitutionToRegisterResponseDto(institution);
        dto.ApiKey = apiKey;
        dto.ApiKeyReference = apiKeyReference;
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

    private static string GenerateApiKey()
    {
        var bytes = new byte[16];
        System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
        return $"flashid_live_{Convert.ToHexString(bytes).ToLower()}";
    }
}