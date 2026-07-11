using Application.Common.Interfaces.ServiceInterfaces;
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
    private readonly IEmailSenderProvider _emailSenderProvider;
    private readonly CitizenMapper _mapper;

    public CitizenService(
        ICitizenRepository citizenRepository,
        IPasswordHashingProvider passwordHashingProvider,
        IEmailSenderProvider emailSenderProvider,
        CitizenMapper mapper)
    {
        _citizenRepository = citizenRepository;
        _passwordHashingProvider = passwordHashingProvider;
        _emailSenderProvider = emailSenderProvider;
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
            PasswordSet = true,
            FailedLoginAttempts = 0,
            LockoutUntil = null,
            LastLoginAt = null,
            IsDeleted = false,
            IsEmailVerified = false,
            Role = UserRole.Citizen,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var otp = GenerateOtp();
        user.SetOtp(_passwordHashingProvider.HashPassword(otp));

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.UserRegistered,
            Details = $"Citizen account registered with email '{request.Email}'.",
            IpAddress = "system",
            ActorId = user.Id,
            CreatedAt = DateTime.UtcNow,
        };

        await _citizenRepository.AddUserAsync(user);
        await _citizenRepository.AddAuditLogAsync(auditLog);
        await _citizenRepository.SaveChangesAsync();

        await SendOtpEmailAsync(user.Email, otp);

        var response = _mapper.CitizenToRegisterResponseDto(user);
        response.Message = "Account created successfully. Please check your email to verify your account.";

        return response;
    }

    private static string GenerateOtp() => Random.Shared.Next(100000, 999999).ToString();

    private Task SendOtpEmailAsync(string toEmail, string otp) => _emailSenderProvider.SendEmailAsync(
        toEmail,
        "Your FlashID verification code",
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
                        Use the verification code below to verify the email address linked to your FlashID account.
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 32px 0 32px;">
                        <div style="background-color:#f7f4ea; border:1px solid #ffb81c; border-radius:12px; padding:20px; text-align:center;">
                            <span style="font-size:32px; font-weight:700; letter-spacing:10px; color:#053b2c;">{otp}</span>
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
        """
    );

    public async Task VerifyEmailAsync(VerifyEmailRequestDto request)
    {
        var user = await _citizenRepository.GetUserByEmailAsync(request.Email) ?? throw new InvalidOtpException();

        if (user.IsEmailVerified) throw new EmailAlreadyVerifiedException();

        if (user.EmailOTPHash is null || user.IsOtpExpired()) throw new OtpExpiredException();

        if (user.OTPAttemptCount >= 5) throw new TooManyOtpAttemptsException();

        if (!_passwordHashingProvider.VerifyPassword(request.OTP, user.EmailOTPHash))
        {
            user.IncrementOtpAttempt();
            await _citizenRepository.UpdateUserAsync(user);
            await _citizenRepository.SaveChangesAsync();
            throw new InvalidOtpException();
        }

        user.MarkEmailVerified();
        await _citizenRepository.UpdateUserAsync(user);
        await _citizenRepository.SaveChangesAsync();
    }

    public async Task ResendOtpAsync(ResendOtpRequestDto request)
    {
        var user = await _citizenRepository.GetUserByEmailAsync(request.Email) ?? throw new InvalidCitizenRegistrationRequestException("No account found with the provided email.");

        if (user.IsEmailVerified) throw new EmailAlreadyVerifiedException();

        var otp = GenerateOtp();
        user.SetOtp(_passwordHashingProvider.HashPassword(otp));
        await _citizenRepository.UpdateUserAsync(user);
        await _citizenRepository.SaveChangesAsync();
        await SendOtpEmailAsync(user.Email, otp);
    }
}