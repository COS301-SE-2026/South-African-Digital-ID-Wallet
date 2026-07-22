using Application.Features.Onboarding.Dtos;

namespace Application.Common.Interfaces.GatewayInterfaces;

public interface IGovernmentRegistryGateway
{
    Task<CitizenRecordDto?> GetCitizenBySaIdAsync(string saId);

}