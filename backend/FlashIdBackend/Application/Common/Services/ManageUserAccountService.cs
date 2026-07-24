using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.ManageUserAccount.DTOs;

namespace Application.Common.Services;

public class ManageUserAccountService : IManageUserAccountService
{
    private readonly IManageUserAccountRepository _manageUserAccountRepository;
    private readonly ManageUserAccountMapper _mapper;

    public ManageUserAccountService(
        IManageUserAccountRepository manageUserAccountRepository,
        ManageUserAccountMapper mapper)
    {
        _manageUserAccountRepository = manageUserAccountRepository;
        _mapper = mapper;
    }

    public async Task<ManageUserAccountDto?> GetAccountAsync(Guid userId)
    {
        var citizen = await _manageUserAccountRepository.GetByUserIdAsync(userId);

        if (citizen is null)
        {
            return null;
        }

        var dto = _mapper.CitizenToManageUserAccountDto(citizen);

        dto.FullName = $"{citizen.Names} {citizen.Surname}";
        dto.IdEnding = citizen.SaId[^3..];
        dto.EmailAddress = citizen.User?.Email ?? string.Empty;
        dto.PhoneNumber = citizen.User?.PhoneNumber ?? string.Empty;
        dto.LastLogin = citizen.User?.LastLoginAt;

        return dto;
    }
}