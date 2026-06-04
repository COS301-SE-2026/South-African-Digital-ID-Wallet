using Application.Features.Onboarding.Dtos;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IMockGovernmentRegistryService
{
    MockIdentityRecordDto? GetBySaId(string idNumber);
}