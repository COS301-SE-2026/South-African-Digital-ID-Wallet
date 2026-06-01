using Application.Common.Interfaces;
using Application.Common.Validation;
using Application.Features.Institutions.DTOs;
using Application.Features.Institutions.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Application.Mappers;

namespace Infrastructure.Services;

public class InstitutionService : IInstitutionService
{
    private readonly AppDbContext _context;
    private readonly InstitutionMapper _mapper;

    public InstitutionService(AppDbContext context, InstitutionMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<RegisterInstitutionResponseDto> RegisterInstitutionAsync(
        RegisterInstitutionRequestDto request
    )
    {
        InstitutionValidator.Validate(request);

        var admin = await _context.GovernmentAdministrators.FirstOrDefaultAsync(a =>
            a.Id == request.AdminId
        );

        if (admin == null)
            throw new AdminNotFoundException(request.AdminId);

        var exists = await _context.Institutions.AnyAsync(i =>
            i.VerificationNumber == request.VerificationNumber
        );

        if (exists)
            throw new InstitutionAlreadyExistsException(request.VerificationNumber);

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

        _context.Institutions.Add(institution);

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.InstitutionRegistered,
            Details =
                $"Institution '{request.Name}' registered by admin '{request.AdminId}'.",
            IpAddress = "system",
            ActorId = admin.UserId,
            CreatedAt = DateTime.UtcNow,
        };

        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();

        return _mapper.ToRegisterDto(institution, apiKey, apiKeyReference);
    }

    public async Task<IEnumerable<GetInstitutionResponseDto>> GetAllInstitutionsAsync()
    {
        var institutions = await _context.Institutions.ToListAsync();

        return institutions.Select(_mapper.ToGetDto);
    }

    public async Task<GetInstitutionResponseDto> GetInstitutionByIdAsync(Guid institutionId)
    {
        var institution = await _context.Institutions.FirstOrDefaultAsync(i =>
            i.Id == institutionId
        );

        if (institution == null)
            throw new InvalidInstitutionRequestException(
                $"Institution with ID '{institutionId}' was not found."
            );

        return _mapper.ToGetDto(institution);
    }

    private static string GenerateApiKey()
    {
        var bytes = new byte[16];
        System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
        return $"flashid_live_{Convert.ToHexString(bytes).ToLower()}";
    }
}