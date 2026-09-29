using System.Security.Cryptography;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Validation;
using Application.Features.Auth.DTOs;
using Application.Features.Citizens.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class PasswordResetService : IPasswordResetService
{
    private const int OtpExpiryMinutes = 15;
    private const int MaxOtpAttempts = 5;

    private readonly IAuthRepository _authRepository;
    private readonly IPasswordHashingProvider _passwordHashingProvider;
    private readonly IEmailSenderProvider _emailSenderProvider;

    public PasswordResetService(IAuthRepository authRepository, IPasswordHashingProvider passwordHashingProvider, IEmailSenderProvider emailSenderProvider)
    {
        _authRepository = authRepository;
        _passwordHashingProvider = passwordHashingProvider;
        _emailSenderProvider = emailSenderProvider;
    }

    public async Task RequestResetAsync(ForgotPasswordRequestDto request)
    {
        var user = await _authRepository.GetUserByEmailAsync(request.Email?.Trim() ?? string.Empty);

        // Return silently for unknown emails so this endpoint cannot be used to discover accounts.
        if (user is null || user.IsDeleted) return;

        // Cryptographically secure, unlike Random, because this code grants account access.
        var otp = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        // Only the hash is stored, the same way registration stores its OTP.
        user.SetOtp(_passwordHashingProvider.HashPassword(otp), OtpExpiryMinutes);

        await _authRepository.UpdateUserAsync(user);
        await _authRepository.SaveChangesAsync();
        await _emailSenderProvider.SendEmailAsync(user.Email, "Reset your FlashID password", BuildEmail(otp));
    }

    public async Task ResetPasswordAsync(ResetPasswordRequestDto request, string ipAddress)
    {
        // Check the new password first so a weak password does not burn an OTP attempt.
        if (request.NewPassword != request.ConfirmPassword)
            throw new InvalidCitizenRegistrationRequestException("Passwords do not match.");
        CitizenRegistrationValidator.ValidatePassword(request.NewPassword);

        var user = await _authRepository.GetUserByEmailAsync(request.Email?.Trim() ?? string.Empty);

        // An unknown email gets the same error as a wrong code, so accounts cannot be probed here either.
        if (user is null || user.IsDeleted) throw new InvalidOtpException();

        if (user.EmailOTPHash is null || user.IsOtpExpired()) throw new OtpExpiredException();
        if (user.OTPAttemptCount >= MaxOtpAttempts) throw new TooManyOtpAttemptsException();

        if (!_passwordHashingProvider.VerifyPassword(request.Otp, user.EmailOTPHash))
        {
            user.IncrementOtpAttempt();
            await _authRepository.UpdateUserAsync(user);
            await _authRepository.SaveChangesAsync();
            throw new InvalidOtpException();
        }

        user.PasswordHash = _passwordHashingProvider.HashPassword(request.NewPassword);
        user.PasswordSet = true;
        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;
        // Bumping the version invalidates every JWT issued before the reset (checked in OnTokenValidated).
        user.TokenVersion++;
        // Receiving the code proves inbox ownership; this also clears the OTP so it cannot be reused.
        user.MarkEmailVerified();

        await _authRepository.AddAuditLogAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.PasswordReset,
            Details = "Password reset using an emailed verification code.",
            ActorId = user.Id,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow,
        });
        await _authRepository.UpdateUserAsync(user);
        await _authRepository.SaveChangesAsync();
    }

    private static string BuildEmail(string otp) =>
        $"""
        <div style="background-color:#f7f4ea; padding:32px 16px; font-family:Arial, Helvetica, sans-serif;">
          <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:16px; padding:28px 32px; border:1px solid #e5e7eb;">
            <div style="font-size:22px; font-weight:700; color:#053b2c;">FlashID</div>
            <p style="color:#111827; font-size:15px; line-height:1.6;">Use this code to reset your password. It expires in {OtpExpiryMinutes} minutes.</p>
            <div style="font-size:32px; font-weight:700; letter-spacing:8px; color:#007a4d; text-align:center; padding:16px 0;">{otp}</div>
            <p style="color:#6b7280; font-size:13px;">If you did not ask for this, you can ignore this email. Your password has not changed.</p>
          </div>
        </div>
        """;
}
