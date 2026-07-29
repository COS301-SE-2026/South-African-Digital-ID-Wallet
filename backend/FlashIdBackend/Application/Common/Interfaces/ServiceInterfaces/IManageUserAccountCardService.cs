using Application.Features.ManageUserAccount.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IManageUserAccountService
{
    Task<ManageUserAccountDto?> GetAccountAsync(Guid userId);
    Task VerifyPasswordAsync(Guid userId, string password, string ipAddress);
    Task RequestEmailChangesAsync(Guid userId, string newEmail);
    Task ResendEmailChangeOtpAsync(Guid userId);
    Task<ManageUserAccountDto?> ConfirmEmailChangeAsync(Guid userId, string otp, string ipAddress);
}