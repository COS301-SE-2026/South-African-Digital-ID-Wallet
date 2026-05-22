using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Common.Interfaces;
using Application.Features.Auth.DTOs;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto> LoginAsync(
        LoginRequestDto request,
        string ipAddress
    )
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new UnauthorizedAccessException("Email is required.");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new UnauthorizedAccessException("Password is required.");

        var user = await _context.DomainUsers.FirstOrDefaultAsync(u =>
            u.Email.ToLower() == request.Email.ToLower()
        );

        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (user.IsDeleted)
            throw new UnauthorizedAccessException("This account has been deleted.");

        if (user.LockoutUntil.HasValue && user.LockoutUntil > DateTime.UtcNow)
            throw new UnauthorizedAccessException(
                $"Account is locked until {user.LockoutUntil.Value:yyyy-MM-dd HH:mm} UTC."
            );

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;

            if (user.FailedLoginAttempts >= 5)
                user.LockoutUntil = DateTime.UtcNow.AddMinutes(30);

            _context.DomainUsers.Update(user);

            var failedLog = new Domain.Entities.AuditLog
            {
                Id = Guid.NewGuid(),
                EventType = AuditEventType.FailedLoginAttempt,
                Details = $"Failed login attempt for {request.Email}.",
                IpAddress = ipAddress,
                ActorId = user.Id,
                CreatedAt = DateTime.UtcNow,
            };
            _context.AuditLogs.Add(failedLog);
            await _context.SaveChangesAsync();

            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;
        user.LastLoginAt = DateTime.UtcNow;
        _context.DomainUsers.Update(user);

        var auditLog = new Domain.Entities.AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.UserLoggedIn,
            Details = $"User {user.Email} logged in successfully.",
            IpAddress = ipAddress,
            ActorId = user.Id,
            CreatedAt = DateTime.UtcNow,
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        var (token, expiresAt) = GenerateJwtToken(user);

        return new LoginResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Role = user.Role.ToString(),
            Names = user.Names,
            Surname = user.Surname,
        };
    }

    public async Task<LogoutResponseDto> LogoutAsync(Guid userId, string ipAddress)
    {
        var user = await _context.DomainUsers.FirstOrDefaultAsync(u => u.Id == userId);

        if (user != null)
        {
            var auditLog = new Domain.Entities.AuditLog
            {
                Id = Guid.NewGuid(),
                EventType = AuditEventType.UserLoggedOut,
                Details = $"User {user.Email} logged out.",
                IpAddress = ipAddress,
                ActorId = user.Id,
                CreatedAt = DateTime.UtcNow,
            };
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        return new LogoutResponseDto { Message = "Logged out successfully." };
    }

    private (string token, DateTime expiresAt) GenerateJwtToken(Domain.Entities.User user)
    {
        var jwtKey =
            _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is not configured.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddHours(8);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("userId", user.Id.ToString()),
            new Claim("role", user.Role.ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}