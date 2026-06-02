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
        // Step 1: validate all input fields before touching the DB.
        CitizenRegistrationValidator.Validate(request);

        // Step 2: find the pre-onboarded citizen record by SA ID.
        var citizen = await _citizenRepository.GetCitizenBySaIdWithUserAsync(request.SaId);

        if (citizen == null)
            throw new CitizenNotFoundException(request.SaId);

        // Step 3: block if already activated — prevents re-registration.
        if (citizen.IsActivated)
            throw new CitizenAlreadyActivatedException(request.SaId);

        // Step 4: check activation code expiry.
        // We throw the same exception for expired and wrong codes intentionally —
        // distinguishing them would tell an attacker whether a code was ever valid.
        if (citizen.ActivationCodeExpiresAt.HasValue &&
            citizen.ActivationCodeExpiresAt.Value < DateTime.UtcNow)
            throw new InvalidActivationCodeException();

        // Step 5: timing-safe comparison prevents side-channel timing attacks.
        var storedBytes = Encoding.UTF8.GetBytes(citizen.ActivationCode);
        var providedBytes = Encoding.UTF8.GetBytes(request.ActivationCode);
        if (!CryptographicOperations.FixedTimeEquals(storedBytes, providedBytes))
            throw new InvalidActivationCodeException();

        // Step 6: ensure username is not taken by a different user.
        if (await _citizenRepository.IsUsernameTakenAsync(request.Username, citizen.UserId))
            throw new UsernameTakenException(request.Username);

        // Step 7: update the pre-existing User record with chosen credentials.
        var user = citizen.User;
        user.Username = request.Username;
        user.PasswordHash = _passwordHashingProvider.HashPassword(request.Password);
        user.UpdatedAt = DateTime.UtcNow;

        // Step 8: activate the citizen and clear the used activation code.
        citizen.IsActivated = true;
        citizen.ActivationCode = string.Empty;
        citizen.UpdatedAt = DateTime.UtcNow;

        // Step 9: write audit log.
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

        // Mapperly maps Citizen (with its loaded User navigation property) to the response DTO.
        return _mapper.CitizenToRegisterResponseDto(citizen);
    }
}