using Application.Features.Onboarding.Dtos;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IGovernmentRegistryGateway
{
    Task<CitizenRecordDto?> GetCitizenBySaIdAsync(string saId);
}