using Application.Features.Onboarding.Dtos;

namespace Application.Common.Interfaces.RepositoryInterfaces;

public interface IMockGovernmentRegistryRepository
{
    MockIdentityRecordDto? GetBySaId(string idNumber);
}