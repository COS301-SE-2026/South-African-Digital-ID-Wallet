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

    public Task<VerificationResponseDto> VerifyCitizenActivation(VerificationRequestDto request, Guid userId,
        CancellationToken cancellationToken)
    {
        return null;
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
}