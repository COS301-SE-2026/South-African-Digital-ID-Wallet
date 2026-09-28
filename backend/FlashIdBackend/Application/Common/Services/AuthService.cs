using System.Security.Cryptography;
using System.Text;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Mapping;
using Application.Features.Auth.DTOs;
using Application.Features.Auth.Exceptions;
using Application.Features.Citizens.DTOs;
using Application.Features.ManageUserAccountCard.DTOs;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Application.Common.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly IJwtTokenProvider _jwtTokenProvider;
    private readonly IPasswordHashingProvider _passwordHashingProvider;
    private readonly ICitizenService _citizenService;
    private readonly AuthMapper _mapper;

    private readonly ITrustedDeviceRepository _trustedDeviceRepository;
    private readonly IDeviceTokenProvider _deviceTokenProvider;
    private readonly IEmailSenderProvider _emailSenderProvider;
    private readonly IHostEnvironment _environment;
    private readonly IIpGeolocationProvider _ipGeolocationProvider;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IAuthRepository authRepository,
        IJwtTokenProvider jwtTokenProvider,
        IPasswordHashingProvider passwordHashingProvider,
        ICitizenService citizenService,
        AuthMapper mapper,
        ITrustedDeviceRepository trustedDeviceRepository,
        IDeviceTokenProvider deviceTokenProvider,
        IEmailSenderProvider emailSenderProvider,
            IHostEnvironment environment,
        IIpGeolocationProvider ipGeolocationProvider,
        ILogger<AuthService> logger)
    {
        _authRepository = authRepository;
        _jwtTokenProvider = jwtTokenProvider;
        _passwordHashingProvider = passwordHashingProvider;
        _citizenService = citizenService;
        _mapper = mapper;
        _trustedDeviceRepository = trustedDeviceRepository;
        _deviceTokenProvider = deviceTokenProvider;
        _emailSenderProvider = emailSenderProvider;
        _environment = environment;
        _ipGeolocationProvider = ipGeolocationProvider;
        _logger = logger;

    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, string? deviceToken, string ipAddress, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new UnauthorizedAccessException("Email is required.");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new UnauthorizedAccessException("Password is required.");

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

        var trustedDevice = await FindTrustedDeviceAsync(user, deviceToken, cancellationToken);

        var skipDeviceVerification = _environment.IsDevelopment() && string.Equals(
            Environment.GetEnvironmentVariable("AUTH_SKIP_DEVICE_VERIFICATION"),
            "true",
            StringComparison.OrdinalIgnoreCase
        );

        if (trustedDevice is null && !skipDeviceVerification)
        {
            var verification = await CreateDeviceVerificationAsync(user, ipAddress, cancellationToken);

            await _authRepository.UpdateUserAsync(user);
            await _authRepository.SaveChangesAsync();

            return new LoginResponseDto
            {
                UserId = user.Id,
                Role = user.Role.ToString(),
                RequiresDeviceVerification = true,
                DeviceVerificationId = verification.Id
            };
        }

        if (trustedDevice is not null)
        {
            trustedDevice.LastActive = DateTime.UtcNow;
            await _trustedDeviceRepository.UpdateTrustedDeviceAsync(trustedDevice, cancellationToken);
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _authRepository.UpdateUserAsync(user);

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.UserLoggedIn,
            Details = $"User {user.Email} logged in successfully from a trusted device.",
            IpAddress = ipAddress,
            ActorId = user.Id,
            CreatedAt = DateTime.UtcNow,
        };
        await _authRepository.AddAuditLogAsync(auditLog);
        await _authRepository.SaveChangesAsync();

        var (token, expiresAt) = _jwtTokenProvider.GenerateToken(user, request.RememberMe);

        var citizen = await _authRepository.GetCitizenByUserIdAsync(user.Id);

        return new LoginResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Role = user.Role.ToString(),
            Names = citizen?.Names,
            Surname = citizen?.Surname,
            RequiresDeviceVerification = false,
        };
    }

    public async Task<LoginResponseDto> VerifyDeviceAsync(VerifyDeviceRequestDto request, string? existingDeviceToken, string? ipAddress,
        CancellationToken cancellationToken)
    {
        if (request.DeviceVerificationId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Device verification ID is required.");
        }

        if (string.IsNullOrEmpty(request.Otp))
        {
            throw new UnauthorizedAccessException("Verification OTP is required.");
        }

        var verification = await _trustedDeviceRepository.GetDeviceVerificationAsync(request.DeviceVerificationId, cancellationToken);

        if (verification is null)
        {
            throw new UnauthorizedAccessException("Device verification request not found.");
        }

        if (verification.VerifiedAt.HasValue)
        {
            throw new UnauthorizedAccessException("Device verification has already been used.");
        }

        if (verification.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Device verification code has expired.");
        }

        if (verification.AttemptCount >= 5)
        {
            throw new UnauthorizedAccessException("Too many verification attempts. Please log in again.");
        }

        var providedOtpHash = HashOtp(request.Otp);

        if (!string.Equals(verification.OtpHash, providedOtpHash, StringComparison.Ordinal))
        {
            verification.AttemptCount++;
            verification.UpdatedAt = DateTime.UtcNow;
            await _trustedDeviceRepository.UpdateDeviceVerificationAsync(verification, cancellationToken);

            var auditLog = new AuditLog()
            {
                Id = Guid.NewGuid(),
                EventType = AuditEventType.DeviceVerificationFailed,
                Details = "Invalid device verification code supplied.",
                IpAddress = ipAddress,
                ActorId = verification.UserId,
                CreatedAt = DateTime.UtcNow,
            };

            await _authRepository.AddAuditLogAsync(auditLog);
            await _authRepository.SaveChangesAsync();

            throw new UnauthorizedAccessException("Invalid device verification code.");
        }

        var user = await _authRepository.GetUserByIdAsync(verification.UserId);

        if (user is null || user.IsDeleted)
        {
            throw new UnauthorizedAccessException("The user account could not be found.");
        }

        var shouldSetDeviceCookie = string.IsNullOrWhiteSpace(existingDeviceToken);
        var rawDeviceToken = shouldSetDeviceCookie ? _deviceTokenProvider.GenerateToken() : existingDeviceToken!;
        var hashedToken = _deviceTokenProvider.HashToken(rawDeviceToken);

        var existingTrustedDevice = await _trustedDeviceRepository.GetByTokenHashAsync(user.Id, hashedToken, cancellationToken);
        IpLocationResult? location = null;
        try
        {
            if (!string.IsNullOrWhiteSpace(ipAddress))
            {
                location = await _ipGeolocationProvider.GetLocationAsync(ipAddress, cancellationToken);
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "IP geolocation lookup failed for device verification. Continuing without location data.");
        }
        if (existingTrustedDevice is null)
        {

            var trustedDevice = new TrustedDevice
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                DeviceTokenHash = hashedToken,
                DeviceType = request.DeviceType,
                OperatingSystem = request.OperatingSystem,
                Browser = request.Browser,
                DeviceName = NormalizeDeviceName(request.DeviceName),
                LastKnownCity = location?.City,
                LastKnownCountry = location?.Country,
                LastActive = DateTime.UtcNow,
                IsTrusted = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await _trustedDeviceRepository.AddTrustedDeviceAsync(trustedDevice, cancellationToken);
        }
        else
        {
            existingTrustedDevice.IsTrusted = true;
            existingTrustedDevice.LastActive = DateTime.UtcNow;
            if (location is not null)
            {
                existingTrustedDevice.LastKnownCity = location.City;
                existingTrustedDevice.LastKnownCountry = location.Country;
            }

            existingTrustedDevice.UpdatedAt = DateTime.UtcNow;
            var incomingName = NormalizeDeviceName(request.DeviceName);
            if (incomingName.Length > 0)
            {
                existingTrustedDevice.DeviceName = incomingName;
            }

            await _trustedDeviceRepository.UpdateTrustedDeviceAsync(existingTrustedDevice, cancellationToken);
        }
        verification.VerifiedAt = DateTime.UtcNow;
        verification.UpdatedAt = DateTime.UtcNow;

        await _trustedDeviceRepository.UpdateDeviceVerificationAsync(verification, cancellationToken);

        var verifiedAuditLog = new AuditLog()
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.DeviceVerified,
            Details = $"User {user.Email} verified and trusted a new device.",
            IpAddress = ipAddress,
            ActorId = verification.UserId,
            CreatedAt = DateTime.UtcNow,
        };

        await _authRepository.AddAuditLogAsync(verifiedAuditLog);

        user.LastLoginAt = DateTime.UtcNow;
        await _authRepository.UpdateUserAsync(user);
        await _authRepository.SaveChangesAsync();

        var (token, expiresAt) = _jwtTokenProvider.GenerateToken(user, request.RememberMe);

        return new LoginResponseDto()
        {
            Token = token,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Role = user.Role.ToString(),

            RequiresDeviceVerification = false,
            DeviceVerificationId = null,

            DeviceToken = shouldSetDeviceCookie ? rawDeviceToken : null,
        };
    }

    private async Task<DeviceVerification> CreateDeviceVerificationAsync(User user, string ipAddress, CancellationToken cancellationToken)
    {
        var otp = RandomNumberGenerator.GetInt32(100000, 1_000_000).ToString();
        var otpHash = HashOtp(otp);

        var verification = new DeviceVerification()
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            OtpHash = otpHash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            AttemptCount = 0,
            VerifiedAt = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _trustedDeviceRepository.AddDeviceVerificationAsync(verification, cancellationToken);

        if (_environment.IsDevelopment())
        {
            Console.WriteLine($"Email otp: {otp}.");
        }

        try
        {
            await SendVerficationOTPAsync(user.Email, otp, cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Device verification email failed for {user.Email}: {ex.Message}");
        }

        var verificationAuditLog = new AuditLog()
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.DeviceVerificationRequested,
            Details = $"Device verification requested for {user.Email}.",
            IpAddress = ipAddress,
            ActorId = user.Id,
            CreatedAt = DateTime.UtcNow,
        };

        await _authRepository.AddAuditLogAsync(verificationAuditLog);
        await _authRepository.SaveChangesAsync();

        return verification;

    }

    private async Task SendVerficationOTPAsync(string toEmail, string rawOtp, CancellationToken cancellationToken)
    {
        await _emailSenderProvider.SendEmailAsync(toEmail, "Your FlashID Device Verification Code",
        $"""
        <div style="background-color:#f7f4ea; padding:32px 16px; font-family:Arial, Helvetica, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; margin:0 auto; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
                <tr>
                    <td style="padding:0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="background-color:#007a4d; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#ffb81c; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#de3831; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#002395; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px 32px 0 32px;">
                        <span style="font-size:20px; font-weight:700; color:#053b2c; letter-spacing:0.5px;">FlashID</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 32px 0 32px; color:#111827; font-size:15px; line-height:1.6;">
                        Hi there,
                        <br /><br />
                        Use the verification code below to verify the device you wish to link to your FlashID account.
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 32px 0 32px;">
                        <div style="background-color:#f7f4ea; border:1px solid #ffb81c; border-radius:12px; padding:20px; text-align:center;">
                            <span style="font-size:32px; font-weight:700; letter-spacing:10px; color:#053b2c;">{rawOtp}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 32px 0 32px; color:#6b7280; font-size:13px; line-height:1.6;">
                        This code is active for the next 10 minutes. Once it expires, you will need to request a new one.
                        <br /><br />
                        If you did not request this code, you can safely ignore this email.
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 32px 28px 32px; color:#111827; font-size:14px; line-height:1.6;">
                        Stay secure,<br />
                        The FlashID Team
                    </td>
                </tr>
                <tr>
                    <td style="padding:0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="background-color:#002395; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#de3831; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#ffb81c; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                                <td style="background-color:#007a4d; width:25%; height:6px; font-size:0; line-height:0;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <p style="text-align:center; color:#9ca3af; font-size:12px; margin-top:16px;">
                &copy; {DateTime.UtcNow.Year} FlashId | South African Digital ID Wallet. All rights reserved.
            </p>
        </div>
        """);
    }

    private static string NormalizeDeviceName(string? deviceName)
    {
        if (string.IsNullOrWhiteSpace(deviceName))
        {
            return string.Empty;
        }
        var trimmed = deviceName.Trim();
        return trimmed.Length <= 100 ? trimmed : trimmed[..100];
    }

    public async Task ResendDeviceVerificationOtpAsync(Guid deviceVerificationId, string ipAddress,
        CancellationToken cancellationToken)
    {
        var verification = await _trustedDeviceRepository.GetDeviceVerificationAsync(deviceVerificationId, cancellationToken);

        if (verification is null)
        {
            throw new UnauthorizedAccessException("Device verification request not found.");
        }

        if (verification.VerifiedAt.HasValue)
        {
            throw new UnauthorizedAccessException("Device verification has already been completed.");
        }

        if (verification.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Device verification code has expired. Please request an OTP resend.");
        }

        var user = await _authRepository.GetUserByIdAsync(verification.UserId);
        if (user is null || user.IsDeleted)
        {
            throw new UnauthorizedAccessException("User account not found or has been deleted.");
        }

        var newOtp = RandomNumberGenerator.GetInt32(100000, 1_000_000).ToString();
        var otpHash = HashOtp(newOtp);

        verification.OtpHash = otpHash;
        verification.UpdatedAt = DateTime.UtcNow;
        verification.ExpiresAt = DateTime.UtcNow.AddMinutes(10);

        await _trustedDeviceRepository.UpdateDeviceVerificationAsync(verification, cancellationToken);

        if (_environment.IsDevelopment())
        {
            Console.WriteLine($"Email otp: {newOtp}.");
        }
        else
        {
            await SendVerficationOTPAsync(user.Email, newOtp, cancellationToken);
        }

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.DeviceVerificationResent,
            Details = $"Device verification code resent for user {user.Email}.",
            IpAddress = ipAddress,
            ActorId = user.Id,
            CreatedAt = DateTime.UtcNow,
        };

        await _authRepository.AddAuditLogAsync(auditLog);
        await _authRepository.SaveChangesAsync();
    }

    private static string HashOtp(string otp)
    {
        var otpBytes = Encoding.UTF8.GetBytes(otp);
        var hashBytes = SHA256.HashData(otpBytes);
        return Convert.ToHexString(hashBytes);
    }

    private async Task<TrustedDevice?> FindTrustedDeviceAsync(User user, string? deviceToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(deviceToken))
        {
            return null;
        }

        var deviceTokenHash = _deviceTokenProvider.HashToken(deviceToken);
        return await _trustedDeviceRepository.GetByTokenHashAsync(user.Id, deviceTokenHash, cancellationToken);
    }

    public async Task<LogoutResponseDto> LogoutAsync(Guid userId, string ipAddress)
    {
        var user = await _authRepository.GetUserByIdAsync(userId);

        if (user != null)
        {
            user.TokenVersion++;
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
        if (user == null)
        {
            return null;
        }
        var citizen = await _authRepository.GetCitizenByUserIdAsync(userId);
        return _mapper.UserToUserProfileDto(user, citizen);
    }
}