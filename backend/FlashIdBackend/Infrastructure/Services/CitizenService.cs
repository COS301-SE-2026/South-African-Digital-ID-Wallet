using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces;
using Application.Common.Validation;
using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class CitizenService : ICitizenService
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly CitizenMapper _mapper;

    public CitizenService(AppDbContext context, IPasswordHasher<User> passwordHasher, CitizenMapper mapper)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<RegisterCitizenResponseDto> RegisterCitizenAsync(
        RegisterCitizenRequestDto request)
    {
        // Step 1: validate all input fields before touching the DB
        CitizenRegistrationValidator.Validate(request);

        // Step 2: find the pre-onboarded citizen record by SA ID
        var citizen = await _context.Citizens
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.SaId == request.SaId);

        if (citizen == null)
            throw new CitizenNotFoundException(request.SaId);

        // Step 3: block if already activated — prevents re-registration
        if (citizen.IsActivated)
            throw new CitizenAlreadyActivatedException(request.SaId);

        // Step 4: check activation code validity — expired and wrong code both throw the
        // same exception so attackers cannot distinguish between the two states.
        if (citizen.ActivationCodeExpiresAt.HasValue &&
            citizen.ActivationCodeExpiresAt.Value < DateTime.UtcNow)
            throw new InvalidActivationCodeException();

        // Step 5: constant-time comparison prevents timing side-channel attacks
        var storedBytes = Encoding.UTF8.GetBytes(citizen.ActivationCode);
        var providedBytes = Encoding.UTF8.GetBytes(request.ActivationCode);
        if (!CryptographicOperations.FixedTimeEquals(storedBytes, providedBytes))
            throw new InvalidActivationCodeException();

        // Step 6: ensure username is not taken by a different user
        var usernameTaken = await _context.DomainUsers
            .AnyAsync(u => u.Username == request.Username && u.Id != citizen.UserId);

        if (usernameTaken)
            throw new UsernameTakenException(request.Username);

        // Step 7: update the pre-existing User record with credentials
        var user = citizen.User;
        user.Username = request.Username;
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        user.UpdatedAt = DateTime.UtcNow;

        // Step 8: activate the citizen and clear the used activation code
        citizen.IsActivated = true;
        citizen.ActivationCode = string.Empty;
        citizen.UpdatedAt = DateTime.UtcNow;

        // Step 9: write audit log
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.UserRegistered,
            Details = $"Citizen with SA ID '{request.SaId}' completed registration via activation code.",
            IpAddress = "system",
            ActorId = user.Id,
            CreatedAt = DateTime.UtcNow,
        };

        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();

        return _mapper.ToDto(citizen, user);
    }
}
