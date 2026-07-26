using Application.Common.Interfaces.ProviderInterfaces;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.UpdatePassword.DTOs;

namespace Application.Common.Services;

public class UpdatePasswordService : IUpdatePasswordService
{
    private readonly IUpdatePasswordRepository _repository;
    private readonly IPasswordHashingProvider _passwordHashingProvider;

    public UpdatePasswordService(
        IUpdatePasswordRepository repository,
        IPasswordHashingProvider passwordHashingProvider)
    {
        _repository = repository;
        _passwordHashingProvider = passwordHashingProvider;
    }

    public async Task<bool> UpdatePasswordAsync(
        Guid userId,
        UpdatePasswordDto updatePasswordDto)
    {
        var user = await _repository.GetUserByIdAsync(userId);

        if (user == null)
            return false;

        if (!_passwordHashingProvider.VerifyPassword(
                updatePasswordDto.CurrentPassword,
                user.PasswordHash))
            return false;

        if (updatePasswordDto.NewPassword != updatePasswordDto.ConfirmPassword)
            return false;

        user.PasswordHash =
            _passwordHashingProvider.HashPassword(updatePasswordDto.NewPassword);

        await _repository.UpdateUserAsync(user);
        await _repository.SaveChangesAsync();

        return true;
    }
}