using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Features.Auth.DTOs;
using Application.Features.Auth.Exceptions;
using Application.Features.Citizens.DTOs;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly IJwtTokenProvider _jwtTokenProvider;
    private readonly IPasswordHashingProvider _passwordHashingProvider;
    private readonly ICitizenService _citizenService;
    private readonly AuthMapper _mapper;

    public AuthService(
        IAuthRepository authRepository,
        IJwtTokenProvider jwtTokenProvider,
        IPasswordHashingProvider passwordHashingProvider,
        ICitizenService citizenService,
        AuthMapper mapper)
    {
        _authRepository = authRepository;
        _jwtTokenProvider = jwtTokenProvider;
        _passwordHashingProvider = passwordHashingProvider;
        _citizenService = citizenService;
        _mapper = mapper;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string ipAddress)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new UnauthorizedAccessException("Email is required.");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new UnauthorizedAccessException("Password is required.");

        // Delegate data access to the repository — the service never calls _context directly.
        var user = await _authRepository.GetUserByEmailAsync(request.Email);

        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (user.IsDeleted)
            throw new UnauthorizedAccessException("This account has been deleted.");

        if (user.LockoutUntil.HasValue && user.LockoutUntil > DateTime.UtcNow)
            throw new UnauthorizedAccessException(
                $"Account is locked until {user.LockoutUntil.Value:yyyy-MM-dd HH:mm} UTC.");

        if (!_passwordHashingProvider.VerifyPassword(request.Password, user.PasswordHash))
        {
            // Business rule: lock after 5 failed attempts for 30 minutes.
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5)
                user.LockoutUntil = DateTime.UtcNow.AddMinutes(30);

            await _authRepository.UpdateUserAsync(user);

            var failedLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                EventType = AuditEventType.FailedLoginAttempt,
                Details = $"Failed login attempt for {request.Email}.",
                IpAddress = ipAddress,
                ActorId = user.Id,
                CreatedAt = DateTime.UtcNow,
            };
            await _authRepository.AddAuditLogAsync(failedLog);
            await _authRepository.SaveChangesAsync();

            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsEmailVerified)
        {
            try
            {
                await _citizenService.ResendOtpAsync(new ResendOtpRequestDto { Email = user.Email });
            }
            catch { /* Ignore errors during otp resend */}

            throw new EmailNotVerifiedException(user.Email);
        }

        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;
        user.LastLoginAt = DateTime.UtcNow;
        await _authRepository.UpdateUserAsync(user);

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.UserLoggedIn,
            Details = $"User {user.Email} logged in successfully.",
            IpAddress = ipAddress,
            ActorId = user.Id,
            CreatedAt = DateTime.UtcNow,
        };
        await _authRepository.AddAuditLogAsync(auditLog);
        await _authRepository.SaveChangesAsync();

        // Token generation is an Infrastructure concern — the service just calls the provider.
        var (token, expiresAt) = _jwtTokenProvider.GenerateToken(user, request.RememberMe);

        return new LoginResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Role = user.Role.ToString(),
            // Names = user.Names,
            // Surname = user.Surname,
        };
    }

    public async Task<LogoutResponseDto> LogoutAsync(Guid userId, string ipAddress)
    {
        var user = await _authRepository.GetUserByIdAsync(userId);

        if (user != null)
        {
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                EventType = AuditEventType.UserLoggedOut,
                Details = $"User {user.Email} logged out.",
                IpAddress = ipAddress,
                ActorId = user.Id,
                CreatedAt = DateTime.UtcNow,
            };
            await _authRepository.AddAuditLogAsync(auditLog);
            await _authRepository.SaveChangesAsync();
        }

        return new LogoutResponseDto { Message = "Logged out successfully." };
    }

    public async Task<UserProfileDto?> GetCurrentUserAsync(Guid userId)
    {
        var user = await _authRepository.GetUserByIdAsync(userId);
        if (user == null) return null;

        // Mapperly-generated mapper converts User entity to UserProfileDto.
        return _mapper.UserToUserProfileDto(user);
    }
}
