using Application.Features.ActivityOverview.DTOs;
using Domain.Entities;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IActivityOverviewRepository
{
    Task<Citizen?> GetCitizenByUserIdAsync(Guid userId);

    Task<List<ActivityOverviewDto>> GetActivityByUserIdAsync(Guid userId);
}