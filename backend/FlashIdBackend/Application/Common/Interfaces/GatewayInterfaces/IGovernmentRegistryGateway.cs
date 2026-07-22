using Application.Features.Credentials.DTOs;
using Application.Features.Onboarding.Dtos;

namespace Application.Common.Interfaces.GatewayInterfaces;

public interface IGovernmentRegistryGateway
{
    Task<CitizenRecordDto?> GetCitizenBySaIdAsync(string saId);
    Task<GovernmentRegistryIdentityDocumentDto?> GetIdentityDocumentBySaIdAsync(string saId, CancellationToken cancellationToken);
    Task<GovernmentRegistryDriversLicenseDto?> GetDriversLicenseBySaIdAsync(string saId, CancellationToken cancellationToken);
}