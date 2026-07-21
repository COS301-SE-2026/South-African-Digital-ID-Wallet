using Application.Features.DashboardAccountCard.DTOs;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IDashboardAccountCardService
{
    Task<DashboardAccountCardDto?> GetMyAccountAsync(Guid userId);
}