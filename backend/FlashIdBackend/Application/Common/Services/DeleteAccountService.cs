using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;

namespace Application.Common.Services;

public class DeleteAccountService : IDeleteAccountService
{
    private readonly IDeleteAccountRepository _repository;

    public DeleteAccountService(
        IDeleteAccountRepository repository)
    {
        _repository = repository;
    }


    public async Task DeleteAccountAsync(Guid userId)
    {
        var citizen = await _repository.GetCitizenByUserIdAsync(userId);

        if (citizen != null)
        {
            await _repository.DeleteQrDisclosureTokensAsync(citizen.Id);
            await _repository.DeleteCredentialsAsync(citizen.Id);
            await _repository.DeleteTrustedDevicesAsync(citizen.Id);
            await _repository.DeleteNotificationsAsync(citizen.Id);
            await _repository.DeleteCitizenAsync(citizen);
        }

        await _repository.DeleteAuditLogsAsync(userId);
        await _repository.DeleteUserAsync(userId);

        await _repository.SaveChangesAsync();
    }
}