using Application.Features.Onboarding.Dtos;

namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IMockGovernmentRegistryRepository
{
    MockIdentityRecordDto? GetBySaId(string idNumber);
}