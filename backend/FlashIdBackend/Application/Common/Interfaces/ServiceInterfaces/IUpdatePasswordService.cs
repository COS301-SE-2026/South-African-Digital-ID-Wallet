using Application.Features.UpdatePassword.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IUpdatePasswordService
{
    Task<bool> UpdatePasswordAsync(
        Guid userId,
        UpdatePasswordDto updatePasswordDto);
}