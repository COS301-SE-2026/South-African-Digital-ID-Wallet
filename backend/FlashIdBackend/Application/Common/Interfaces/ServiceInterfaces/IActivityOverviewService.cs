using Application.Features.ActivityOverview.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IActivityOverviewService
{
    Task<List<ActivityOverviewDto>> GetMyActivityAsync(Guid userId);
}