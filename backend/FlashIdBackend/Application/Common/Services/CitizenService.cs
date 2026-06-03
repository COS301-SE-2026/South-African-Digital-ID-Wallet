using System.Security.Cryptography;
using System.Text;
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


        var citizen = await _citizenRepository.GetCitizenBySaIdWithUserAsync(request.SaId);

        if (citizen == null)
            throw new CitizenNotFoundException(request.SaId);


        if (citizen.IsActivated)
            throw new CitizenAlreadyActivatedException(request.SaId);


        if (citizen.ActivationCodeExpiresAt.HasValue &&
            citizen.ActivationCodeExpiresAt.Value < DateTime.UtcNow)
            throw new InvalidActivationCodeException();


        var storedBytes = Encoding.UTF8.GetBytes(citizen.ActivationCode);
        var providedBytes = Encoding.UTF8.GetBytes(request.ActivationCode);
        if (!CryptographicOperations.FixedTimeEquals(storedBytes, providedBytes))
            throw new InvalidActivationCodeException();


        if (await _citizenRepository.IsUsernameTakenAsync(request.Username, citizen.UserId))
            throw new UsernameTakenException(request.Username);


        var user = citizen.User;
        user.Username = request.Username;
        user.PasswordHash = _passwordHashingProvider.HashPassword(request.Password);
        user.UpdatedAt = DateTime.UtcNow;


        citizen.IsActivated = true;
        citizen.ActivationCode = string.Empty;
        citizen.UpdatedAt = DateTime.UtcNow;


        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.UserRegistered,
            Details = $"Citizen with SA ID '{request.SaId}' completed registration.",
            IpAddress = "system",
            ActorId = user.Id,
            CreatedAt = DateTime.UtcNow,
        };

        await _citizenRepository.UpdateUserAsync(user);
        await _citizenRepository.UpdateCitizenAsync(citizen);
        await _citizenRepository.AddAuditLogAsync(auditLog);
        await _citizenRepository.SaveChangesAsync();


        return _mapper.CitizenToRegisterResponseDto(citizen);
    }
}