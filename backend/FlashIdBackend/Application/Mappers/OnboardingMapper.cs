using Application.Features.Onboarding.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Mappers;

[Mapper]
public partial class OnboardingMapper
{
    public OnboardCitizenResponseDto ToDto(Citizen citizen, MockIdentityRecordDto identityRecord, string activationCode) => new()
    {
        CitizenId = citizen.Id,
        SaId = identityRecord.SaId,
        ActivationCode = activationCode,
        ActivationCodeExpiresAt = citizen.ActivationCodeExpiresAt,
        Status = "Pending"
    };
}