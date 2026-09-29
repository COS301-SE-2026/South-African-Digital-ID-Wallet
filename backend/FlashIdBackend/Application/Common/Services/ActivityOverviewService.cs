using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Application.Features.ActivityOverview.DTOs;

namespace Application.Common.Services;

public class ActivityOverviewService : IActivityOverviewService
{
    private readonly IActivityOverviewRepository _repository;

    public ActivityOverviewService(IActivityOverviewRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ActivityOverviewDto>> GetMyActivityAsync(Guid userId)
    {
        return await _repository.GetActivityByUserIdAsync(userId);
    }
}