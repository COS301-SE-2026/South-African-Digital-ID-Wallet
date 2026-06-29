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

        await _citizenRepository.AddUserAync(user);
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
        $"<p>Your verification code is <strong>{otp}</strong>. It expires in 10 minutes.</p><p>If you did not request this code, please ignore this email.</p>"
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