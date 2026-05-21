using Application.Common.Interfaces;
using Application.Common.Validation;
using Application.Features.GovernmentAdministrators.DTOs;
using Application.Features.GovernmentAdministrators.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class GovAdminService : IGovAdminService
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;

    public GovAdminService(AppDbContext context, IPasswordHasher<User> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<RegisterGovAdminResponseDto> RegisterGovAdminAsync(
        RegisterGovAdminRequestDto request)
    {
        // Step 1: validate all inputs before touching the DB
        GovAdminRegistrationValidator.Validate(request);

        // Step 2: check government ID not already registered
        var govIdTaken = await _context.GovernmentAdministrators
            .AnyAsync(g => g.GovernmentId == request.GovernmentId);

        if (govIdTaken)
            throw new GovAdminAlreadyExistsException(request.GovernmentId);

        // Step 3: check email not taken
        var emailTaken = await _context.DomainUsers
            .AnyAsync(u => u.Email == request.Email);

        if (emailTaken)
            throw new GovAdminEmailTakenException(request.Email);

        // Step 4: check username not taken
        var usernameTaken = await _context.DomainUsers
            .AnyAsync(u => u.Username == request.Username);

        if (usernameTaken)
            throw new GovAdminUsernameTakenException(request.Username);

        var now = DateTime.UtcNow;

        // Step 5: create the User record
        var user = new User
        {
            Id = Guid.NewGuid(),
            Names = request.FirstName,
            Surname = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Username = request.Username,
            PasswordHash = string.Empty,
            Role = UserRole.GovernmentAdministrator,
            IsDeleted = false,
            IsEmailVerified = false,
            FailedLoginAttempts = 0,
            CreatedAt = now,
            UpdatedAt = now,
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.DomainUsers.Add(user);

        // Step 6: create the GovernmentAdministrator record
        var govAdmin = new GovernmentAdministrator
        {
            Id = Guid.NewGuid(),
            GovernmentId = request.GovernmentId,
            UserId = user.Id,
            CreatedAt = now,
            UpdatedAt = now,
        };

        _context.GovernmentAdministrators.Add(govAdmin);

        // Step 7: write audit log
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.UserRegistered,
            Details = $"Government administrator '{request.GovernmentId}' registered.",
            IpAddress = "system",
            ActorId = user.Id,
            CreatedAt = now,
        };

        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();

        return new RegisterGovAdminResponseDto
        {
            GovAdminId = govAdmin.Id,
            UserId = user.Id,
            GovernmentId = govAdmin.GovernmentId,
            Username = user.Username,
            Email = user.Email,
            CreatedAt = govAdmin.CreatedAt,
        };
    }
}
