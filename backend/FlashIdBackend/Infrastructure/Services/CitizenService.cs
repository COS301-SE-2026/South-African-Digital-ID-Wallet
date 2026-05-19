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

    public CitizenService(AppDbContext context, IPasswordHasher<User> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<RegisterCitizenResponseDto> RegisterCitizenAsync(
        RegisterCitizenRequestDto request)
    {
        CitizenRegistrationValidator.Validate(request);

        var saIdTaken = await _context.Citizens.AnyAsync(c => c.SaId == request.SaId);
        if (saIdTaken)
            throw new CitizenAlreadyRegisteredException(request.SaId);

        var usernameTaken = await _context.DomainUsers.AnyAsync(u => u.Username == request.Username);
        if (usernameTaken)
            throw new UsernameTakenException(request.Username);

        var now = DateTime.UtcNow;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Names = string.Empty,
            Surname = string.Empty,
            // Unique placeholder — will be updated once the citizen's credentials are linked.
            // SA ID is unique so this email is guaranteed unique.
            Email = $"pending.{request.SaId}@flashid.local",
            PhoneNumber = string.Empty,
            Username = request.Username,
            PasswordHash = string.Empty,
            Role = UserRole.Citizen,
            IsDeleted = false,
            IsEmailVerified = false,
            FailedLoginAttempts = 0,
            CreatedAt = now,
            UpdatedAt = now,
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.DomainUsers.Add(user);

        var citizen = new Citizen
        {
            Id = Guid.NewGuid(),
            SaId = request.SaId,
            ActivationCode = string.Empty,
            IsActivated = true,
            UserId = user.Id,
            CreatedAt = now,
            UpdatedAt = now,
        };

        _context.Citizens.Add(citizen);

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.UserRegistered,
            Details = $"Citizen self-registered with SA ID '{request.SaId}'.",
            IpAddress = "system",
            ActorId = user.Id,
            CreatedAt = now,
        };

        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();

        return new RegisterCitizenResponseDto
        {
            CitizenId = citizen.Id,
            UserId = user.Id,
            SaId = citizen.SaId,
            Username = user.Username,
            CreatedAt = citizen.CreatedAt,
        };
    }
}
