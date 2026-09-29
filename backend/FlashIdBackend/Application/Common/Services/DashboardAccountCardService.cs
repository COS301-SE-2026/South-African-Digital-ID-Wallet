using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Common.Mapping;
using Application.Features.DashboardAccountCard.DTOs;

namespace Application.Common.Services;

public class DashboardAccountCardService : IDashboardAccountCardService
{
    private readonly IDashboardAccountCardRepository _repository;
    private readonly DashboardAccountCardMapper _mapper;

    public DashboardAccountCardService(
        IDashboardAccountCardRepository repository,
        DashboardAccountCardMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<DashboardAccountCardDto?> GetMyAccountAsync(Guid userId)
    {
        var citizen = await _repository.GetCitizenByUserIdAsync(userId);

        if (citizen == null)
            return null;

        return _mapper.CitizenToResponseDto(citizen);
    }
}