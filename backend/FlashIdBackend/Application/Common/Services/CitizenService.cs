using Application.Common.Interfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Common.Validation;
using Application.Features.Citizens.DTOs;
using Application.Features.Citizens.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class CitizenService : ICitizenService
{
    private readonly ICitizenRepository _citizenRepository;
    private readonly IPasswordHashingProvider _passwordHashingProvider;
    private readonly CitizenMapper _mapper;

    public CitizenService(
        ICitizenRepository citizenRepository,
        IPasswordHashingProvider passwordHashingProvider,
        CitizenMapper mapper)
    {
        _citizenRepository = citizenRepository;
        _passwordHashingProvider = passwordHashingProvider;
        _mapper = mapper;
    }

    public async Task<RegisterCitizenResponseDto> RegisterCitizenAsync(RegisterCitizenRequestDto request)
    {

        CitizenRegistrationValidator.Validate(request);

        if (await _citizenRepository.IsEmailTakenAsync(request.Email, Guid.Empty))
            throw new EmailTakenException(request.Email);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.Trim(),
            PasswordHash = _passwordHashingProvider.HashPassword(request.Password),
            FailedLoginAttempts = 0,
            LockoutUntil = null,
            LastLoginAt = null,
            IsDeleted = false,
            IsEmailVerified = true,
            Role = UserRole.Citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };


        // var user = citizen.User;
        // user.PasswordHash = _passwordHashingProvider.HashPassword(request.Password);
        // user.UpdatedAt = DateTime.UtcNow;

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.UserRegistered,
            Details = $"Citizen account registered with email '{request.Email}'.",
            IpAddress = "system",
            ActorId = user.Id,
            CreatedAt = DateTime.UtcNow,
        };

        await _citizenRepository.AddUserAync(user);
        // await _citizenRepository.UpdateCitizenAsync(citizen);
        await _citizenRepository.AddAuditLogAsync(auditLog);
        await _citizenRepository.SaveChangesAsync();


        return _mapper.CitizenToRegisterResponseDto(user);
    }
}