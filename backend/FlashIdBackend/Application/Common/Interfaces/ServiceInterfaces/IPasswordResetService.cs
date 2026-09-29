using Application.Features.Auth.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IPasswordResetService
{
    Task RequestResetAsync(ForgotPasswordRequestDto request);
    Task ResetPasswordAsync(ResetPasswordRequestDto request, string ipAddress);
}
