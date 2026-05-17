using Application.Common.Interfaces;
using Application.Common.Validation;
using Application.Features.Institutions.DTOs;
using Application.Features.Institutions.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class InstitutionService : IInstitutionService
{
    private readonly AppDbContext _context;

    public InstitutionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<RegisterInstitutionResponseDto> RegisterInstitutionAsync(
        RegisterInstitutionRequestDto request
    )
    {
        // step 1 - validate the request
        InstitutionValidator.Validate(request);

        // step 2 - check the admin exists
        var admin = await _context.GovernmentAdministrators.FirstOrDefaultAsync(a =>
            a.Id == request.AdminId
        );

        if (admin == null)
            throw new AdminNotFoundException(request.AdminId);

        // step 3 - check no duplicate verification number
        var exists = await _context.Institutions.AnyAsync(i =>
            i.VerificationNumber == request.VerificationNumber
        );

        if (exists)
            throw new InstitutionAlreadyExistsException(request.VerificationNumber);

        // step 4 - generate API key and key vault reference
        var apiKey = GenerateApiKey();
        var apiKeyReference = Guid.NewGuid();

        // step 5 - create the institution record
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

        // step 6 - write audit log
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

        // step 7 - return the response
        return new RegisterInstitutionResponseDto
        {
            InstitutionId = institution.Id,
            Name = institution.Name,
            Type = institution.Type.ToString(),
            ApiKey = apiKey,
            ApiKeyReference = apiKeyReference,
            VerificationNumber = institution.VerificationNumber,
            CreatedAt = institution.CreatedAt,
        };
    }

    // generates a secure random API key in the format flashid_live_<32 hex chars>
    private static string GenerateApiKey()
    {
        var bytes = new byte[16];
        System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
        return $"flashid_live_{Convert.ToHexString(bytes).ToLower()}";
    }
}