using Application.Features.ManageUserAccount.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IManageUserAccountService
{
    Task<ManageUserAccountDto?> GetAccountAsync(Guid userId);
}