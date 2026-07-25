using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Common.Validation;
using Application.Features.ManageUserAccount.DTOs;
using Application.Features.ManageUserAccountCard.Exceptions;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Services;

public class ManageUserAccountService : IManageUserAccountService
{
    private readonly IManageUserAccountRepository _manageUserAccountRepository;
    private readonly ManageUserAccountMapper _mapper;
    private readonly IPasswordHashingProvider _passwordHashingProvider;
    private readonly IEmailSenderProvider _emailSenderProvider;

    public ManageUserAccountService(
        IManageUserAccountRepository manageUserAccountRepository,
        ManageUserAccountMapper mapper,
        IPasswordHashingProvider passwordHashingProvider,
        IEmailSenderProvider emailSenderProvider)
    {
        _manageUserAccountRepository = manageUserAccountRepository;
        _mapper = mapper;
        _passwordHashingProvider = passwordHashingProvider;
        _emailSenderProvider = emailSenderProvider;
    }

    public async Task<ManageUserAccountDto?> GetAccountAsync(Guid userId)
    {
        var citizen = await _manageUserAccountRepository.GetByUserIdAsync(userId);

        if (citizen is null)
        {
            return null;
        }

        return BuildAccountDto(citizen);
    }

    public async Task VerifyPasswordAsync(Guid userId, string password, string ipAddress)
    {
        var user = await _manageUserAccountRepository.GetUserByIdAsync(userId) ?? throw new IncorrectPasswordException();

        if (user.LockoutUntil.HasValue && user.LockoutUntil > DateTime.UtcNow) throw new AccountLockedException(user.LockoutUntil.Value);

        if (!_passwordHashingProvider.VerifyPassword(password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5) user.LockoutUntil = DateTime.UtcNow.AddMinutes(30);

            await _manageUserAccountRepository.UpdateUserAsync(user);
            await _manageUserAccountRepository.AddAuditLogAsync(new AuditLog
            {
                Id = Guid.NewGuid(),
                EventType = AuditEventType.FailedLoginAttempt,
                Details = $"Failed password verification for an email ({user.Email}) update",
                IpAddress = ipAddress,
                ActorId = userId,
                CreatedAt = DateTime.UtcNow,
            });

            await _manageUserAccountRepository.SaveChangesAsync();

            throw new IncorrectPasswordException();
        }

        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;
        user.MarkPasswordReverified();

        await _manageUserAccountRepository.UpdateUserAsync(user);
        await _manageUserAccountRepository.SaveChangesAsync();
    }

    public async Task RequestEmailChangesAsync(Guid userId, string newEmail)
    {
        var user = await _manageUserAccountRepository.GetUserByIdAsync(userId) ?? throw new ReauthRequiredException();

        if (!user.IsPasswordReverificationValid()) throw new ReauthRequiredException();
        if (string.IsNullOrWhiteSpace(newEmail) || !EmailValidator.IsValid(newEmail)) throw new InvalidEmailException();

        var cleanedEmail = newEmail.Trim();

        if (await _manageUserAccountRepository.IsEmailTakenAsync(cleanedEmail, userId)) throw new NewEmailTakenException(cleanedEmail);

        var otp = GenerateOtp();

        user.SetPendingEmailChange(cleanedEmail, _passwordHashingProvider.HashPassword(otp));
        user.CleatPasswordReverification();

        await _manageUserAccountRepository.UpdateUserAsync(user);
        await _manageUserAccountRepository.SaveChangesAsync();
        await SendEmailChangeOtpAsync(cleanedEmail, otp);
    }

    public async Task ResendEmailChangeOtpAsync(Guid userId)
    {
        var user = await _manageUserAccountRepository.GetUserByIdAsync(userId) ?? throw new NoPendingEmailChangeException();

        if (user.PendingEmail is null) throw new NoPendingEmailChangeException();

        var otp = GenerateOtp();

        user.SetPendingEmailChange(user.PendingEmail, _passwordHashingProvider.HashPassword(otp));

        await _manageUserAccountRepository.UpdateUserAsync(user);
        await _manageUserAccountRepository.SaveChangesAsync();
        await SendEmailChangeOtpAsync(user.PendingEmail, otp);
    }

    public async Task<ManageUserAccountDto> ConfirmEmailChangeAsync(Guid userId, string otp, string ipAddress)
    {
        var user = await _manageUserAccountRepository.GetUserByIdAsync(userId) ?? throw new NoPendingEmailChangeException();

        if (user.PendingEmail is null) throw new NoPendingEmailChangeException();
        if (user.EmailOTPHash is null || user.IsOtpExpired()) throw new EmailChangeOtpExpiredException();
        if (user.OTPAttemptCount >= 5) throw new TooManyEmailChangeOtpAttemptsException();
        if (!_passwordHashingProvider.VerifyPassword(otp, user.EmailOTPHash))
        {
            user.IncrementOtpAttempt();
            await _manageUserAccountRepository.UpdateUserAsync(user);
            await _manageUserAccountRepository.SaveChangesAsync();
            throw new InvalidEmailChangeOtpException();
        }

        if (await _manageUserAccountRepository.IsEmailTakenAsync(user.PendingEmail, userId))
        {
            var takenEmail = user.PendingEmail;
            user.ClearPendingEmailChange();
            await _manageUserAccountRepository.UpdateUserAsync(user);
            await _manageUserAccountRepository.SaveChangesAsync();
            throw new NewEmailTakenException(takenEmail);
        }

        user.ConfirmEmailChange();

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = AuditEventType.EmailAddressChanged,
            Details = $"Email changed to '{user.Email}'",
            IpAddress = ipAddress,
            ActorId = user.Id,
            CreatedAt = DateTime.UtcNow,
        };

        var saved = await _manageUserAccountRepository.TryConfirmEmailChangeAsync(user, auditLog);

        if (!saved)
        {
            throw new NewEmailTakenException(user.Email);
        }

        var citizen = await _manageUserAccountRepository.GetByUserIdAsync(userId);
        if (citizen is null)
        {
            return null;
        }
        else
        {
            return BuildAccountDto(citizen);
        }
    }

    private ManageUserAccountDto BuildAccountDto(Citizen c)
    {
        var dto = _mapper.CitizenToManageUserAccountDto(c);

        dto.FullName = $"{c.Names} {c.Surname}";
        dto.IdEnding = c.SaId[^3..];
        dto.EmailAddress = c.User?.Email ?? string.Empty;
        dto.PhoneNumber = c.User?.PhoneNumber ?? string.Empty;
        dto.LastLogin = c.User?.LastLoginAt;

        return dto;
    }

    private static string GenerateOtp() => Random.Shared.Next(100000, 999999).ToString();

    private Task SendEmailChangeOtpAsync(string toEmail, string otp) => _emailSenderProvider.SendEmailAsync(
        toEmail,
        "Please confirm your updated FlashID email address",
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
                         Use the verification code below to confirm this email address as the new email for your FlashID account.
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
                         If you did not request this code, you can safely ignore this email and consider changing your password.
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
}