using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.Verification.Dtos;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class CitizenVerificationService : ICitizenVerificationService
{

    private const int InitialMaxPinAttempts = 3;
    private const int SecondMaxPinAttempts = 5;
    private const int FinalMaxPinAttempts = 6;

    private readonly IVerificationRepository _verificationRepository;

    public CitizenVerificationService(IVerificationRepository verificationRepository)
    {
        _verificationRepository = verificationRepository;

    }

    public async Task<VerificationResponseDto> VerifyCitizenActivation(VerificationRequestDto request, Guid userId,
        string ipAddress, CancellationToken cancellationToken)
    {
        ValidateRequest(request);

        var cleanSaId = request.SaId;
        var cleanPin = request.Pin;
        var tokenHash = HashToken(request.Token.Trim());

        var activation = await _verificationRepository.GetActivationByTokenHashAsync(tokenHash, cancellationToken);

        if (activation is null)
        {
            throw new InvalidOperationException("Activation details are invalid.");
        }

        var now = DateTime.UtcNow;

        ValidateActivationState(activation, now);

        var citizen = await _verificationRepository.GetCitizenByUserIdAsync(userId, cancellationToken);
        if (citizen is null)
        {
            throw new InvalidOperationException("Citizen linked to this activation could not be found.");
        }

        if (!string.Equals(citizen.SaId, cleanSaId, StringComparison.Ordinal))
        {
            await RecordFailedAttemptAsync(activation, now, cancellationToken);
            throw new InvalidOperationException("Activation details are invalid.");
        }
        var pinMatches = BCrypt.Net.BCrypt.Verify(cleanPin, activation.PinHash);
        if (!pinMatches)
        {
            await RecordFailedAttemptAsync(activation, now, cancellationToken);
            throw new InvalidOperationException("Activation details are invalid.");
        }

        await ValidateAccountLinkingAsync(citizen, userId, cancellationToken);

        citizen.UserId = userId;
        citizen.Status = CitizenStatus.Activated;
        citizen.UpdatedAt = now;

        activation.Status = ActivationStatus.Used;
        activation.UsedAt = now;
        activation.UpdatedAt = now;
        activation.LockedUntil = null;

        var auditLog = new AuditLog()
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.CitizenVerified,
            Details = $"Citizen {citizen.Id} was verified using the activation link verification service.",
            ActorId = userId,
            CreatedAt = now,
            IpAddress = ipAddress,
        };

        await _verificationRepository.AddAuditLogAsync(auditLog, cancellationToken);
        await _verificationRepository.SaveChangesAsync(cancellationToken);

        return new VerificationResponseDto
        {
            CitizenId = citizen.Id,
            Status = citizen.Status.ToString(),
            IsVerified = true,
            Message = "Your identity has been verified successfully."
        };
    }

    private static void ValidateRequest(VerificationRequestDto request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(request.Token))
        {
            throw new ArgumentException("Activation token is required");
        }

        if (string.IsNullOrWhiteSpace(request.SaId) || !Regex.IsMatch(request.SaId.Trim(), @"^\d{13}$",
                RegexOptions.None, TimeSpan.FromSeconds(500)))
        {
            throw new ArgumentException("A valid 13-digit South African ID number is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Pin) || !Regex.IsMatch(request.Pin.Trim(), @"^\d{6}$",
                RegexOptions.None, TimeSpan.FromSeconds(500)))
        {
            throw new ArgumentException("A valid 6-digit activation pin is required.");
        }
    }

    public static void ValidateActivationState(CitizenActivation activation, DateTime now)
    {
        if (activation.Status == ActivationStatus.Used || activation.UsedAt is not null)
        {
            throw new InvalidOperationException("Activation has already been used.");
        }

        if (activation.Status == ActivationStatus.Revoked || activation.RevokedAt is not null)
        {
            throw new InvalidOperationException("Activation is no longer valid.");
        }

        if (activation.ExpiresAt <= now)
        {
            throw new InvalidOperationException("Activation has expired.");
        }

        if (activation.LockedUntil is not null && activation.LockedUntil > now)
        {
            var timeLeft = activation.LockedUntil - now;
            throw new InvalidOperationException($"Activation is temporarily locked.{timeLeft} minutes remaining.");
        }
    }

    private async Task ValidateAccountLinkingAsync(Citizen citizen, Guid userId, CancellationToken cancellationToken)
    {
        if (citizen.UserId is not null && citizen.UserId != userId)
        {
            throw new InvalidOperationException("The citizen has already been linked to another account.");
        }

        var citizenAlreadyLinkedToUser =
            await _verificationRepository.GetCitizenByUserIdAsync(userId, cancellationToken);

        if (citizenAlreadyLinkedToUser is not null && citizenAlreadyLinkedToUser.SaId != citizen.SaId)
        {
            throw new InvalidOperationException("The account has already been linked to another citizen.");
        }
    }

    private async Task RecordFailedAttemptAsync(CitizenActivation activation, DateTime now,
        CancellationToken cancellationToken)
    {
        activation.AttemptCount++;
        activation.UpdatedAt = now;
        switch (activation.AttemptCount)
        {
            case InitialMaxPinAttempts:
                activation.LockedUntil = now.AddMinutes(5);
                break;
            case SecondMaxPinAttempts:
                activation.LockedUntil = now.AddMinutes(10);
                break;
            case FinalMaxPinAttempts:
                activation.Status = ActivationStatus.Revoked;
                activation.RevokedAt = now;
                activation.LockedUntil = null;
                break;
        }

        await _verificationRepository.SaveChangesAsync(cancellationToken);
    }

    private static string HashToken(string rawToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(rawToken);
        var tokenBytes = Encoding.UTF8.GetBytes(rawToken);
        var hashBytes = SHA256.HashData(tokenBytes);
        return Convert.ToHexString(hashBytes);
    }
}